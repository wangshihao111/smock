import { Request, Response } from "express";
import { AxiosRequestConfig, Method, AxiosError } from "axios";
import { FileUtil, ProxyConfig } from "./file-util";
import hash from 'object-hash';
import FormData from 'form-data';

export class RequestUtil {
  private static config: ProxyConfig;
  public static setProxyConfig(config:ProxyConfig) { this.config = config } ;
  public static parseRequest(
    req: Request,
    config: ProxyConfig
  ): AxiosRequestConfig {
    const { body, query, method, headers, cookies, path } = req;
    let referer = '';
    // if (/.*(\.js|\.css)$/.test(path)) {
    //   referer = headers.referer.split('?')[0].replace(/^https?:\/\/.*\:\d+/, config.target);
    // } else {
    //   // referer = ;
    // }
    console.log('body', req.body)
    const passedHeaders = {
      ...headers,
      referer: (headers.referer || '').replace(/^https?:\/\/.*\:\d+/, config.target),
      origin: config.target,
      host: config.target.replace(/^https?:\/\//, ""),
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"
    };

    let data;
    if (headers['content-type'] && headers['content-type'].match('application/x-www-form-urlencoded')) {
      data = this.changeToFormData(body);
    } else if (headers['content-type'] && headers['content-type'].match('multipart/form-data')) {
      const data = new FormData();
      for(const key in body) {
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
      validateStatus: (status) => {
        return (100 < status && status < 300) || status === 302;
      }
    };
  }

  public static processResponseError(
    error: AxiosError,
    request: Request,
    response: Response,
    storagePath: string,
    requestConfig: AxiosRequestConfig
  ) {
    // 处理axios错误
    if (error.response) {
      const { status, headers, data } = error.response;
      response.status(status);
      // FileUtil.addRequestLog(storagePath, requestConfig, {status, headers, data});
      return response.send(data);
    } else {
      console.log(error)
      this.getResponseFromHistory(request, response, requestConfig, storagePath);
    }
  }

  public static async getResponseFromHistory(
    request: Request,
    response: Response,
    reqConfig: AxiosRequestConfig,
    storagePath: string
  ) {
    const resHis = await FileUtil.getRequestLog(storagePath, reqConfig);
    if (resHis) {
      const { status = 200, headers={}, data } = resHis;
      response.status(status);
      for (const key in headers) {
        response.header(key, headers[key])
      }
      return response.send(data);
    } else {
      response.status(404);
      return response.send({
        success: false,
        message: '404 未找到'
      });
    }
  }

  public static getUniqueKeyFromRequest(config: AxiosRequestConfig) {
    const { data, params, method } = config;
    return hash({data, params, method});
  }

  public static assignHeadersToResponse(headers: any, response: Response) {
    for (const key in headers) {
      response.header(key, headers[key]);
      if (key === 'location') {
        response.header(key, headers[key].replace(this.config.target, `http://localhost:${this.config.workPort}`));
      }
    }
  }

  public static changeToFormData(obj = {}) {
    // const result = new FormData();
    // for (const key in obj) {
    //   result.append(key, obj[key]);
    // }
    // return result;
    let result = ''

    for (const key in obj) {
      result += `${key}=${obj[key]}&`;
    }
    result = result.slice(0, result.length - 1);
    return result;
  }
}
