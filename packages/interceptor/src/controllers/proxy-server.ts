import {Application, RequestHandler, Response, Request} from 'express';
import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { RequestUtil } from '../utils/request-util';
import { FileUtil, ProxyConfig } from '../utils/file-util';
import { applyCors } from '../middlewares/cors.middleware';

export class ProxyServer {
  private app: Application;
  private target: string;
  private config: ProxyConfig;
  constructor(app: Application) {
    this.app = app;
    this.requestMiddleware = this.requestMiddleware.bind(this);
  }

  private requestMiddleware(req: Request, res: Response) {
    const requestConfig: AxiosRequestConfig = RequestUtil.parseRequest(req, this.config);
    // 缓存文件存储位置
    const storagePath = FileUtil.getFilePath(requestConfig.url);
    axios(requestConfig)
      .then((axiosRes: AxiosResponse) => {
        const { status, headers, data } = axiosRes;
        res.status(status);
        
        RequestUtil.assignHeadersToResponse(headers, res);
        if (headers['content-type']) {
          res.contentType(headers['content-type'])
        }
        FileUtil.addRequestLog(storagePath, requestConfig, {
          status,
          headers,
          data,
        });
        res.send(data);
      })
      .catch((e: AxiosError) => {
        RequestUtil.processResponseError(e, req, res, storagePath, requestConfig);
      });
  }

  public asMiddleware(): RequestHandler {
    return this.requestMiddleware;
  }

  public run(): number {
    FileUtil.initFolder();
    this.app.use(applyCors);
    const config = FileUtil.loadConfig();
    RequestUtil.setProxyConfig(config);
    this.config = config;
    this.target = config.target;
    this.app.use(this.requestMiddleware);
    return config.workPort
  }
}
