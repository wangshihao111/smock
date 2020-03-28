import { GlobalContext } from './context-util';
import { binaryPattern, staticPattern } from './patterns';
import { Request, Response } from 'express';
import { AxiosRequestConfig, Method, AxiosError } from 'axios';
import hash from 'object-hash';
import FormData from 'form-data';

export class RequestUtil {
  private ctx: GlobalContext;

  constructor (ctx: GlobalContext) {
    this.ctx = ctx;
  }

  public parseRequest (req: Request): AxiosRequestConfig {
    const { body, query, method, headers, path } = req;
    const { config } = this.ctx;
    const passedHeaders = {
      ...headers,
      referer: (headers.referer || '').replace(
        /^https?:\/\/.*:\d+/,
        config.target
      ),
      origin: config.target,
      host: config.target.replace(/^https?:\/\//, ''),
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
    };

    let data;
    if (
      headers['content-type'] &&
      headers['content-type'].match('application/x-www-form-urlencoded')
    ) {
      data = this.changeToFormData(body);
    } else if (
      headers['content-type'] &&
      headers['content-type'].match('multipart/form-data')
    ) {
      const data = new FormData();
      for (const key in body) {
        data.append(key, body[key]);
      }
    } else {
      data = body;
    }
    const parsedConfig: AxiosRequestConfig = {
      url: `${config.target}${path}`,
      method: method as Method,
      headers: passedHeaders,
      params: query,
      data,
      withCredentials: true,
      maxRedirects: 0,
      validateStatus: (status): boolean =>
        (status > 100 && status < 300) || status === 302
    };
    if (binaryPattern.test(req.path)) {
      parsedConfig.responseType = 'arraybuffer';
    }
    return parsedConfig;
  }

  public processResponseError (
    error: AxiosError,
    request: Request,
    response: Response,
    requestConfig: AxiosRequestConfig
  ): void {
    // 处理axios错误
    if (error.response) {
      const { status, data } = error.response;
      response.status(status);
      response.send(data);
      return;
    }
    // console.log(error);
    if (this.ctx.config.cacheStatic && staticPattern.test(request.path)) {
      response.status(200);
      response.sendFile(this.ctx.file.getFilePath(request.path, true));
      return;
    }
    // this.getResponseFromHistory(request, response, requestConfig, storagePath);
    response.status(404);
    response.send();
  }

  public async getResponseFromHistory (
    request: Request,
    response: Response,
    reqConfig: AxiosRequestConfig,
    path: string
  ): Promise<void> {
    const resHis = await this.ctx.file.getRequestLog(path, reqConfig);
    if (resHis) {
      const { status = 200, headers = {}, data } = resHis.response;
      response.status(status);
      for (const key in headers) {
        response.header(key, headers[key]);
      }
      response.send(data);
      return;
    }
    response.status(404);
    response.send();
  }

  public getUniqueKeyFromRequest (
    config: AxiosRequestConfig,
    currentPath: string
  ): string {
    const { data, params, method } = config;
    const obj = { data, params, method };
    const {
      pathIgnore: { query = [], body = [] }
    } = this.ctx.config;
    if (query.includes(currentPath)) {
      delete obj.params;
    }
    if (body.includes(currentPath)) {
      delete obj.data;
    }
    return hash(obj);
  }

  public assignHeadersToResponse (headers: any, response: Response): void {
    for (const key in headers) {
      response.header(key, headers[key]);
      if (key === 'location') {
        const loc = headers[key].replace(
          this.ctx.config.target,
          `http://localhost:${this.ctx.config.workPort}`
        );
        headers.location = loc;
        response.header(key, loc);
      }
    }
  }

  public changeToFormData (obj = {} as any): string {
    let result = '';

    for (const key in obj) {
      result += `${key}=${encodeURIComponent(obj[key])}&`;
    }
    result = result.slice(0, result.length - 1);
    return result;
  }
}
