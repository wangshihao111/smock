import { JsDefinition, JsApiItem } from './../domain/JsDefinition';
import { MockFileContent, ApiItem } from './../domain/JsonFile';
import { config } from './../config/variables';
import { MockUtil } from './mock.util';
import { Request, Response, Application } from 'express'
import { isEqual, toLower } from 'lodash';
const prettier = require('prettier');

export class MockService {
  private localDefinitions: Map<string, MockFileContent>;
  private jsDefinitions: Map<string, JsDefinition>;
  private controllerMap: Map<string, any>;
  private app;
  private port: number;
  private host: string;

  constructor(app: Application, port: number, host: string) {
    this.controllerMap = new Map();
    this.localDefinitions = new Map();
    this.jsDefinitions = new Map();
    this.app = app;
    this.port = port;
    this.host = host;
  }

  public init() {
    this.createControllers();
    this.initDocApis();
  }

  public createControllers(): any {
    this.getLocalDefinition();
    this.localDefinitions.forEach(definition => {
      const { name, apis } = definition;
      const controllers = apis.map((api) => this.createController(api, name));
      this.controllerMap.set(name, controllers);
    });
    this.jsDefinitions.forEach(jsDef => this.applyJsDefinition(jsDef));
  }

  private getLocalDefinition(): void {
    const [jsonDefs, jsDefs] = MockUtil.readLocalFile(config.base);
    this.localDefinitions = jsonDefs;
    this.jsDefinitions = jsDefs;
  }

  private createController(api: ApiItem, jsonName: string): any {
    const { url, method, response, responseType, desc, mock_data } = api;
    const _this = this;
    function handleRequest(req: Request, res: Response) {
      const { body, query, method: requestMethod } = req;
      const hasMatch = _this.localDefinitions.get(jsonName).apis.find(a => {
        return a.url === url && toLower(a.method) === toLower(requestMethod)
      });
      const queryValid = MockUtil.validateParams(api.query || {}, query, true)
      const bodyValid = MockUtil.validateParams(api.body||{}, body);
      if (responseType) {
        res.type(responseType);
      }
      // 如果没有匹配到的路由
      if (!hasMatch) {
        res.status(404)
        return res.send({
          status: 404,
          message: 'Not Found:' + url
        })
      }
      const data = _this.findOne(body, query, api);
      console.log('find data', data);
      // TODO: 将数据中需要mock的数据换成mock数据
      if (data) {
        const responseData = MockUtil.getMockedData(response, data.response);
        return res.send(responseData)
      }
      // 如果参数类型不匹配

      if (!queryValid || !bodyValid) {
        res.status(400);
        return res.send({
          status: 400,
          message: '参时不匹配，请检查数据类型'
        })
      }
      // TODO: 其它情况，返回模拟数据
      const mocked = MockUtil.getMockedData(response, {})
      return res.send(mocked)
    }
    this.app[toLower(method)](url, handleRequest)
    return handleRequest;
  }

  private findOne(body, query, api: ApiItem): any {
    const mockData = api.mock_data || [];
    if (typeof body === 'string') {
      return mockData.find( v => v.body === body);
    }
    let mock = mockData.find(m => {
      const queryEqual = isEqual(MockUtil.changeQueryToString(m.query), query);
      const bodyEqual = isEqual(m.body, body)
      if (m.body && m.query) {
        return  bodyEqual && queryEqual;
      } else if (m.query) return queryEqual;
      else if (m.body) return bodyEqual
      else return false;
    });
    if (!mock) {
      mock = mockData.find(v => !v.body && !v.query)
    }
    return mock;
  }

  public registerDefinition(definitions: MockFileContent[]): void {
    definitions.forEach(def => this.localDefinitions.set(def.name, def))
  }

  public applyJsDefinition(obj: JsDefinition): void {
    this.jsDefinitions.set(obj.name, obj);
    const createHandler = (api: JsApiItem) => (req: Request, res: Response): void => {
      const result = api.handle(req, res);
      res.send(result);
    }
    obj.apis.forEach(api => this.app[toLower(api.method)](api.url, createHandler(api)));
  }

  /**
   * initDocApis
   */
  public initDocApis() {
    const apiListUrl = '/__api-list';
    const apiUrl = '/__api';
    // 添加api list 获取接口
    this.app.get('/__api-info', (req: Request, res: Response) => {
      res.send({
        port: this.port,
        host: this.host,
      })
    });
    this.app.get(apiListUrl, (req: Request, res: Response) => {
      const list = [];
      this.localDefinitions.forEach(def => {
        list.push({
          name: def.name,
          type: 'json',
          apiList: def.apis.map(v => ({name: v.name, url: v.url, type: 'json', method: v.method}))
        })
      });
      this.jsDefinitions.forEach(def => {
        list.push({
          name: def.name,
          type: 'js',
          apiList: def.apis.map(v => ({name: v.name, url: v.url, type: "js", method: v.method}))
        })
      });
      return res.send(list);
    });

    this.app.get(apiUrl, (req: Request, res: Response) => {
      const { query: {name, apiName, type} } = req;
      if (type === 'json') {
        const jsonDef = this.localDefinitions.get(name);
        const api = jsonDef.apis.find(api => api.name === apiName);
        return res.send(api);
      }
      if (type === 'js') {
        const jsDef = this.jsDefinitions.get(name);
        const api = jsDef.apis.find(v => v.name === apiName);
        let handleStr = api.handle.toString();
        handleStr = handleStr.startsWith('handle') ? 'function ' + handleStr : handleStr;
        const data = {
          ...api,
          handle: prettier.format(handleStr, {semi: true, tabWidth: 2, parser: 'babel'})
        };
        return res.send(data);
      }
    })
  }
}
