import { staticPattern } from './../utils/patterns';
import { DbUtil } from './../utils/db-util';
import {
  Application, RequestHandler, Response, Request
} from 'express';
import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { RequestUtil } from '../utils/request-util';
import { FileUtil, ProxyConfig } from '../utils/file-util';
import { defaultConfig } from '../config/config';

export class ProxyServer {
  private app: Application;

  private config: ProxyConfig;

  private port: number;

  constructor (app: Application, port: number) {
    this.config = defaultConfig;
    this.app = app;
    this.port = port;
    this.requestMiddleware = this.requestMiddleware.bind(this);
  }

  private requestMiddleware (req: Request, res: Response): void {
    const db = DbUtil.getDb();
    const requestConfig: AxiosRequestConfig = RequestUtil.parseRequest(req, this.config);

    const interceptList = db.interceptList || [];
    // 如果是拦截目标，走本地缓存
    if (DbUtil.hasArrayStringItem(interceptList, req.path)) {
      RequestUtil.getResponseFromHistory(req, res, requestConfig, req.path);
    } else {
    axios(requestConfig)
      .then((axiosRes: AxiosResponse) => {
        const { status, headers, data } = axiosRes;
        res.status(status);
        RequestUtil.assignHeadersToResponse(headers, res);
        // 正则匹配到的将缓存到本地
        if (this.config.matchRegexp.test(req.path) && !staticPattern.test(req.path)) {
          FileUtil.addRequestLog(req.path, requestConfig, {
            path: req.path,
            status,
            headers,
            data
          });
        }
        if (this.config.cacheStatic && staticPattern.test(req.path)) {
          FileUtil.storageStatic(req.path, axiosRes)
        }
        // 只记录非静态资源的路径,存放进db
        if (!staticPattern.test(req.path)) {
          const apiList = db.apiList || [];
          DbUtil.addStringArrayItem(apiList, req.path);
          DbUtil.set('apiList', apiList);
        }
        res.send(data);
      })
      .catch((e: AxiosError) => {
        RequestUtil.processResponseError(e, req, res, requestConfig);
      });
    }
  }

  public asMiddleware (): RequestHandler {
    return this.requestMiddleware;
  }

  public run (): number {
    FileUtil.initFolder();
    const config = FileUtil.loadConfig();
    if (this.port) {
      config.workPort = this.port;
    }
    RequestUtil.setProxyConfig(config);
    this.config = config;
    this.app.use(this.requestMiddleware);
    return this.config.workPort;
  }
}
