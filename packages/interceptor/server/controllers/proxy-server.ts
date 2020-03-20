import { DbUtil } from './../utils/db-util';
import { defaultConfig } from './../utils/file-util';
import {
  Application, RequestHandler, Response, Request
} from 'express';
import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { RequestUtil } from '../utils/request-util';
import { FileUtil, ProxyConfig } from '../utils/file-util';

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
    const assetsPattern = /^.*(\.js|\.css|\.png|\.svg|\.jpg|\.woff|\.ttf|\.map|\.gif)/g
    const storagePath = FileUtil.getFilePath(req.path as string);

    const interceptList = db.interceptList || [];
    if (DbUtil.hasArrayStringItem(interceptList, req.path) && !assetsPattern.test(req.path)) {
      RequestUtil.getResponseFromHistory(req, res, requestConfig, storagePath);
    } else {
      // 缓存文件存储位置
    axios(requestConfig)
      .then((axiosRes: AxiosResponse) => {
        const { status, headers, data } = axiosRes;
        res.status(status);
        RequestUtil.assignHeadersToResponse(headers, res);
        // 只记录非静态资源的路径
        if (!assetsPattern.test(req.path)) {
          const apiList = db.apiList || [];
          DbUtil.addStringArrayItem(apiList, req.path);
          DbUtil.set('apiList', apiList);
          FileUtil.addRequestLog(storagePath, requestConfig, {
            path: req.path,
            status,
            headers,
            data
          });
        }
        res.send(data);
      })
      .catch((e: AxiosError) => {
        RequestUtil.processResponseError(e, req, res, storagePath, requestConfig);
      });
    }
  }

  public asMiddleware (): RequestHandler {
    return this.requestMiddleware;
  }

  public run (): void {
    FileUtil.initFolder();
    const config = FileUtil.loadConfig();
    config.workPort = this.port;
    RequestUtil.setProxyConfig(config);
    this.config = config;
    this.app.use(this.requestMiddleware);
  }
}
