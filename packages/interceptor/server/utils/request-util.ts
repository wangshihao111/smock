import { Request, Response } from 'express';
import { AxiosRequestConfig, Method, AxiosError } from 'axios';
import hash from 'object-hash';
import FormData from 'form-data';
import { FileUtil, ProxyConfig } from './file-util';

export class RequestUtil {
  private static config: ProxyConfig;

  public static setProxyConfig (config: ProxyConfig): void { this.config = config; }

  public static parseRequest (
    req: Request,
    config: ProxyConfig
  ): AxiosRequestConfig {
    const {
      body, query, method, headers, path
    } = req;
    const passedHeaders = {
      ...headers,
      referer: (headers.referer || '').replace(/^https?:\/\/.*:\d+/, config.target),
      origin: config.target,
      host: config.target.replace(/^https?:\/\//, ''),
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
    };

    let data;
    if (headers['content-type'] && headers['content-type'].match('application/x-www-form-urlencoded')) {
      data = this.changeToFormData(body);
    } else if (headers['content-type'] && headers['content-type'].match('multipart/form-data')) {
      const data = new FormData();
      for (const key in body) {
        data.append(key, body[key]);
      }
    } else {
      data = body;
    }
    return {
      url: `${config.target}${path}`,
      method: method as Method,
      headers: passedHeaders,
      params: query,
      data,
      withCredentials: true,
      maxRedirects: 0,
      validateStatus: (status): boolean => (status > 100 && status < 300) || status === 302
    };
  }

  public static processResponseError (
    error: AxiosError,
    request: Request,
    response: Response,
    storagePath: string,
    requestConfig: AxiosRequestConfig
  ): void {
    // 处理axios错误
    if (error.response) {
      const { status, data } = error.response;
      response.status(status);
      response.send(data);
      return;
    }
    console.log(error);
    this.getResponseFromHistory(request, response, requestConfig, storagePath);
  }

  public static async getResponseFromHistory (
    request: Request,
    response: Response,
    reqConfig: AxiosRequestConfig,
    storagePath: string
  ): Promise<void> {
    const resHis = await FileUtil.getRequestLog(storagePath, reqConfig);
    if (resHis) {
      const { status = 200, headers = {}, data } = resHis;
      response.status(status);
      for (const key in headers) {
        response.header(key, headers[key]);
      }
      response.send(data);
      return;
    }
    response.status(404);
    response.send({
      success: false,
      message: '404 未找到'
    });
  }

  public static getUniqueKeyFromRequest (config: AxiosRequestConfig): string {
    const { data, params, method } = config;
    return hash({ data, params, method });
  }

  public static assignHeadersToResponse (headers: Headers, response: Response): void {
    for (const key in headers) {
      response.header(key, headers[key]);
      if (key === 'location') {
        response.header(key, headers[key].replace(this.config.target, `http://localhost:${this.config.workPort}`));
      }
    }
  }

  public static changeToFormData (obj = {}): string {
    let result = '';

    for (const key in obj) {
      result += `${key}=${obj[key]}&`;
    }
    result = result.slice(0, result.length - 1);
    return result;
  }
}
