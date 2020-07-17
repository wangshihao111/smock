import { Request, Response, Application, RequestHandler, NextFunction } from "express"
import { isEqual, toLower } from "lodash"
import { JsDefinition, JsApiItem } from "../domain/JsDefinition"
import { MockFileContent, ApiItem } from "../domain/JsonFile"
import { MockUtil } from "./mock.util"
import prettier from "prettier"
import { debounce } from "lodash"
import { mockFilePrefix } from "./_constant"
import chokidar from "chokidar"
import { match } from "path-to-regexp"
import chalk from "chalk"

export interface IdObj {
  method: string
  url: string
}

function keyGen(url: string, method: string): string {
  return JSON.stringify({ url, method })
}

function decodeKey(key: string): IdObj {
  return JSON.parse(key) as IdObj
}

export class MockService {
  private jsonDefinitions: Map<string, MockFileContent>

  private jsDefinitions: Map<string, JsDefinition>

  private app: Application

  private port: number

  private host: string

  private jsonApiMap: Map<string, RequestHandler>
  private jsApiMap: Map<string, RequestHandler>
  private docMap: Map<string, RequestHandler>
  private docHandler: RequestHandler

  constructor(app: Application, port: number, host: string) {
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
    const handleMiddleware = this.createMiddleware()
    this.app.use(handleMiddleware)
  }

  private async seUpWatcher() {
    MockUtil.init()
    const config = MockUtil.config
    const watchHandler = debounce(async (fileName: string) => {
      console.log(chalk.yellow(`检测到${mockFilePrefix}文件夹或${mockFilePrefix}文件, 加载文件.`))
      this.reset()
    }, 1000)
    const watcher = chokidar.watch(
      [
        `./**/${mockFilePrefix}/**`,
        `./**/${mockFilePrefix}.[jt]s`,
        `./**/${mockFilePrefix}.json5`,
        `./**/${mockFilePrefix}.json`,
      ],
      {
        ignored: ["node_modules/**"],
        persistent: true,
        cwd: config.mockCwd || process.cwd(),
      }
    )
    watcher.on("all", (path) => {
      watchHandler(path)
    })
  }

  public createMiddleware() {
    this.seUpWatcher()
    this.reset()
    return this.handle.bind(this)
  }

  private handle(req: Request, res: Response, next) {
    let matched
    const processHandle = (val: RequestHandler, key: string) => {
      const idObj = decodeKey(key)
      if (toLower(idObj.method) !== toLower(req.method)) return
      const mch = match(idObj.url, { decode: decodeURIComponent })(req.path)
      if (mch) {
        req.params = mch.params as any
        matched = val
      }
    }
    this.jsonApiMap.forEach(processHandle)
    if (!matched) {
      this.jsApiMap.forEach(processHandle)
    }
    if (!matched) {
      this.docHandler(req, res, next)
    } else {
      matched(req, res, next)
    }
  }

  public reset(): void {
    this.jsonDefinitions = new Map()
    this.jsDefinitions = new Map()
    this.jsonApiMap = new Map<string, RequestHandler>()
    this.jsApiMap = new Map<string, RequestHandler>()
    this.createControllers()
  }

  public createControllers(): any {
    this.getLocalDefinition()
    this.jsonDefinitions.forEach((definition) => {
      const { name, apis = [] } = definition
      apis
        .map((api) => this.createController(api, name))
        .forEach(([hash, c]) => {
          this.jsonApiMap.set(hash, c)
        })
    })
    this.jsDefinitions.forEach((jsDef) => this.applyJsDefinition(jsDef))
  }

  private getLocalDefinition(): void {
    const [jsonDefs, jsDefs] = MockUtil.readLocalFile()
    this.jsonDefinitions = jsonDefs
    this.jsDefinitions = jsDefs
  }

  private createController(api: ApiItem, jsonName: string): any {
    const { url, method, response, responseType, delay = "" } = api
    const handleRequest = (req: Request, res: Response, next): void => {
      const { body, query, params } = req
      const hasMatch = this.jsonDefinitions
        .get(jsonName)
        .apis.find((a) => a.url === url && toLower(a.method) === toLower(method))
      const queryValid = MockUtil.validateParams(api.query || {}, query, true)
      const bodyValid = MockUtil.validateParams(api.body || {}, body)
      const delayTime = MockUtil.getDelayTime(String(delay))
      let sendData: any
      if (responseType) {
        res.type(responseType)
      }
      // 如果没有匹配到的路由
      if (!hasMatch) {
        return next()
      }
      const data = this.findOne({ body, query, api, params })
      // 将数据中需要mock的数据换成mock数据
      if (data) {
        sendData = MockUtil.getMockedData(response, data.response)
      } else if (!queryValid || !bodyValid) {
        // 如果参数类型不匹配
        res.status(400)
        sendData = {
          status: 400,
          message: "参时不匹配，请检查数据类型",
        }
      } else {
        // 其它情况，返回模拟数据
        sendData = MockUtil.getMockedData(response, {})
      }
      setTimeout(() => {
        res.send(sendData)
      }, delayTime * 1000)
    }
    const key = keyGen(url, toLower(method))
    return [key, handleRequest]
  }

  private findOne({ body, query, api, params }): any {
    const mockData = api.mock_data || []
    const mockList = mockData.filter((m) => {
      const equals = {
        body: isEqual(m.body, body),
        query: isEqual(MockUtil.changeQueryToString(m.query), query),
        params: isEqual(params, MockUtil.changeQueryToString(m.params || {})),
      }
      const existKeys = [m.query && "query", m.body && "body", m.params && "params"].filter(Boolean)
      return existKeys.length ? existKeys.map((k: string) => equals[k]).every((v) => v) : true
    })
    let mock
    if (!mockList) {
      mock = mockData.find((v) => !v.body && !v.query)
    } else {
      const index = Math.floor(mockList.length * Math.random())
      mock = mockList[index]
    }
    return mock
  }

  public applyJsDefinition(obj: JsDefinition): void {
    this.jsDefinitions.set(obj.name, obj)
    const createHandler = (api: JsApiItem): RequestHandler => async (
      req: Request,
      res: Response
    ): Promise<void> => {
      const result = api.handle(req, res)
      // 有返回体时，将其发送给客户端
      if (result) {
        const { status = 200, delay, data } = result
        let delayTime = 0
        if (delay !== undefined) {
          delayTime = MockUtil.getDelayTime(String(delay))
        }
        setTimeout(() => {
          res.status(status)
          res.send(data)
        }, delayTime * 1000)
      }
    }
    ;(obj.apis || []).forEach((api) => {
      const key = keyGen(api.url, toLower(api.method))
      this.jsApiMap.set(key, createHandler(api))
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
          apiList: (def.apis || []).map((v) => ({
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
          apiList: (def.apis || []).map((v) => ({
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
        const jsonDef = this.jsonDefinitions.get(name as any)
        const api = jsonDef.apis.find((api) => api.name === apiName)
        return res.send(api)
      }
      if (type === "js") {
        const jsDef = this.jsDefinitions.get(name as any)
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
}
