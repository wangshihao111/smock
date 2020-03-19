import {
  Application, RequestHandler, Response, Request
} from 'express';
import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { RequestUtil } from '../utils/request-util';
import { FileUtil, ProxyConfig } from '../utils/file-util';

export class ProxyServer {
  private app: Application;

  private target: string;

  private config: ProxyConfig;

  private port: number;

  constructor (app: Application, port: number) {
    this.app = app;
    this.port = port;
    this.requestMiddleware = this.requestMiddleware.bind(this);
  }

  private requestMiddleware (req: Request, res: Response): void {
    const requestConfig: AxiosRequestConfig = RequestUtil.parseRequest(req, this.config);
    // 缓存文件存储位置
    const storagePath = FileUtil.getFilePath(requestConfig.url);
    axios(requestConfig)
      .then((axiosRes: AxiosResponse) => {
        const { status, headers, data } = axiosRes;
        res.status(status);

        RequestUtil.assignHeadersToResponse(headers, res);
        if (headers['content-type']) {
          res.contentType(headers['content-type']);
        }
        FileUtil.addRequestLog(storagePath, requestConfig, {
          status,
          headers,
          data
        });
        res.send(data);
      })
      .catch((e: AxiosError) => {
        RequestUtil.processResponseError(e, req, res, storagePath, requestConfig);
      });
  }

  public asMiddleware (): RequestHandler {
    return this.requestMiddleware;
  }

  public run (): void {
    FileUtil.initFolder();
    const config = FileUtil.loadConfig();
    // if (port) {
    //   config.workPort = port;
    // }
    config.workPort = this.port;
    RequestUtil.setProxyConfig(config);
    this.config = config;
    this.target = config.target;
    this.app.use(this.requestMiddleware);
  }
}
