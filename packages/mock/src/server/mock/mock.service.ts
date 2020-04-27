import { Request, Response, Application, RequestHandler, NextFunction } from "express"
import { isEqual, toLower } from "lodash"
import { JsDefinition, JsApiItem } from "../domain/JsDefinition"
import { MockFileContent, ApiItem } from "../domain/JsonFile"
import { config } from "../config/variables"
import { MockUtil } from "./mock.util"
import prettier from "prettier"
import objectHash from "object-hash"

export class MockService {
  private jsonDefinitions: Map<string, MockFileContent>

  private jsDefinitions: Map<string, JsDefinition>

  private controllerMap: Map<string, Function[]>

  private app: Application

  private port: number

  private host: string

  private jsonApiMap: Map<string, RequestHandler>
  private jsApiMap: Map<string, RequestHandler>
  private docMap: Map<string, RequestHandler>
  private docHandler: RequestHandler

  constructor(app: Application, port: number, host: string) {
    this.controllerMap = new Map()
    this.jsonDefinitions = new Map()
    this.jsDefinitions = new Map()
    this.jsonApiMap = new Map<string, RequestHandler>()
    this.jsApiMap = new Map<string, RequestHandler>()
    this.docMap = new Map<string, RequestHandler>()
    this.app = app
    this.port = port
    this.host = host
    this.docHandler = this.createDocMiddleware()
  }

  public init(): void {
    this.createControllers()
    this.initDocApis()
    this.app.use((req, res, next) => this.handle(req, res, next))
  }

  public createMiddleware() {
    this.reset()
    return this.handle.bind(this)
  }

  private handle(req: Request, res: Response, next) {
    const { path, method } = req
    const hash = objectHash({ url: path, method: method.toLowerCase() })
    const handler = this.jsonApiMap.get(hash) || this.jsApiMap.get(hash)
    if (!handler) {
      this.docHandler(req, res, next)
    } else {
      handler(req, res, next)
    }
  }

  public reset(): void {
    this.controllerMap = new Map()
    this.jsonDefinitions = new Map()
    this.jsDefinitions = new Map()
    this.jsonApiMap = new Map<string, RequestHandler>()
    this.jsApiMap = new Map<string, RequestHandler>()
    this.createControllers()
  }

  public createControllers(): any {
    this.getLocalDefinition()
    this.jsonDefinitions.forEach((definition) => {
      const { name, apis } = definition
      apis
        .map((api) => this.createController(api, name))
        .forEach(([hash, c]) => {
          this.jsonApiMap.set(hash, c)
        })
    })
    this.jsDefinitions.forEach((jsDef) => this.applyJsDefinition(jsDef))
  }

  private getLocalDefinition(): void {
    const [jsonDefs, jsDefs] = MockUtil.readLocalFile(config.base)
    this.jsonDefinitions = jsonDefs
    this.jsDefinitions = jsDefs
  }

  private createController(api: ApiItem, jsonName: string): any {
    const { url, method, response, responseType } = api
    const handleRequest = (req: Request, res: Response): void => {
      const { body, query } = req
      const hasMatch = this.jsonDefinitions
        .get(jsonName)
        .apis.find((a) => a.url === url && toLower(a.method) === toLower(method))
      const queryValid = MockUtil.validateParams(api.query || {}, query, true)
      const bodyValid = MockUtil.validateParams(api.body || {}, body)
      if (responseType) {
        res.type(responseType)
      }
      // 如果没有匹配到的路由
      if (!hasMatch) {
        res.status(404)
        res.send({
          status: 404,
          message: `Not Found:${url}`,
        })
        return
      }
      const data = this.findOne(body, query, api)
      // 将数据中需要mock的数据换成mock数据
      if (data) {
        const responseData = MockUtil.getMockedData(response, data.response)
        res.send(responseData)
        return
      }
      // 如果参数类型不匹配
      if (!queryValid || !bodyValid) {
        res.status(400)
        res.send({
          status: 400,
          message: "参时不匹配，请检查数据类型",
        })
        return
      }
      // 其它情况，返回模拟数据
      const mocked = MockUtil.getMockedData(response, {})
      res.send(mocked)
    }
    // this.app[toLower(method)](url, handleRequest);
    const hash = objectHash({ url, method: method.toLowerCase() })
    return [hash, handleRequest]
  }

  private findOne(body, query, api: ApiItem): any {
    const mockData = api.mock_data || []
    if (typeof body === "string") {
      return mockData.find((v) => v.body === body)
    }
    let mock = mockData.find((m) => {
      const queryEqual = isEqual(MockUtil.changeQueryToString(m.query), query)
      const bodyEqual = isEqual(m.body, body)
      if (m.body && m.query) {
        return bodyEqual && queryEqual
      }
      if (m.query) return queryEqual
      if (m.body) return bodyEqual
      return false
    })
    if (!mock) {
      mock = mockData.find((v) => !v.body && !v.query)
    }
    return mock
  }

  public registerDefinition(definitions: MockFileContent[]): void {
    definitions.forEach((def) => this.jsonDefinitions.set(def.name, def))
  }

  public applyJsDefinition(obj: JsDefinition): void {
    this.jsDefinitions.set(obj.name, obj)
    const createHandler = (api: JsApiItem): RequestHandler => (
      req: Request,
      res: Response
    ): void => {
      const result = api.handle(req, res)
      // 有返回体时，将其发送给客户端
      if (result) {
        const { status = 200, data } = result
        res.status(status)
        res.send(data)
      }
    }
    obj.apis.forEach((api) => {
      const hash = objectHash({ url: api.url, method: api.method.toLowerCase() })
      this.jsApiMap.set(hash, createHandler(api))
    })
  }
  public createDocMiddleware() {
    const { docMap } = this
    docMap.set("/__api-list", (req: Request, res: Response, next) => {
      const list = []
      this.jsonDefinitions.forEach((def) => {
        list.push({
          name: def.name,
          type: "json",
          apiList: def.apis.map((v) => ({
            name: v.name,
            url: v.url,
            type: "json",
            method: v.method,
          })),
        })
      })
      this.jsDefinitions.forEach((def) => {
        list.push({
          name: def.name,
          type: "js",
          apiList: def.apis.map((v) => ({
            name: v.name,
            url: v.url,
            type: "js",
            method: v.method,
          })),
        })
      })
      return res.send(list)
    })
    docMap.set("/__api", (req: Request, res: Response) => {
      const {
        query: { name, apiName, type },
      } = req
      if (type === "json") {
        const jsonDef = this.jsonDefinitions.get(name)
        const api = jsonDef.apis.find((api) => api.name === apiName)
        return res.send(api)
      }
      if (type === "js") {
        const jsDef = this.jsDefinitions.get(name)
        const api = jsDef.apis.find((v) => v.name === apiName)
        let handleStr = api.handle.toString()
        handleStr = handleStr.startsWith("handle") ? `function ${handleStr}` : handleStr
        const data = {
          ...api,
          handle: prettier.format(handleStr, { semi: true, tabWidth: 2, parser: "babel" }),
        }
        return res.send(data)
      }
    })
    docMap.set("/__api-info", (req: Request, res: Response) => {
      res.send({
        port: this.port,
        host: this.host,
      })
    })
    return function (req: Request, res: Response, next: NextFunction) {
      const { path } = req
      const handler = docMap.get(path)
      if (handler) {
        handler(req, res, next)
      } else {
        next()
      }
    }
  }
  /**
   * initDocApis
   */
  public initDocApis(): void {
    const apiListUrl = "/__api-list"
    const apiUrl = "/__api"
    // 添加api list 获取接口
    this.app.get("/__api-info", (req: Request, res: Response) => {
      res.send({
        port: this.port,
        host: this.host,
      })
    })
    this.app.get(apiListUrl, (req: Request, res: Response) => {
      const list = []
      this.jsonDefinitions.forEach((def) => {
        list.push({
          name: def.name,
          type: "json",
          apiList: def.apis.map((v) => ({
            name: v.name,
            url: v.url,
            type: "json",
            method: v.method,
          })),
        })
      })
      this.jsDefinitions.forEach((def) => {
        list.push({
          name: def.name,
          type: "js",
          apiList: def.apis.map((v) => ({
            name: v.name,
            url: v.url,
            type: "js",
            method: v.method,
          })),
        })
      })
      return res.send(list)
    })

    this.app.get(apiUrl, (req: Request, res: Response) => {
      const {
        query: { name, apiName, type },
      } = req
      if (type === "json") {
        const jsonDef = this.jsonDefinitions.get(name)
        const api = jsonDef.apis.find((api) => api.name === apiName)
        return res.send(api)
      }
      if (type === "js") {
        const jsDef = this.jsDefinitions.get(name)
        const api = jsDef.apis.find((v) => v.name === apiName)
        let handleStr = api.handle.toString()
        handleStr = handleStr.startsWith("handle") ? `function ${handleStr}` : handleStr
        const data = {
          ...api,
          handle: prettier.format(handleStr, { semi: true, tabWidth: 2, parser: "babel" }),
        }
        return res.send(data)
      }
    })
  }
}
