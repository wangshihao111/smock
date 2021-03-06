import { GlobalContext } from "./context-util";
import { binaryPattern, staticPattern } from "./patterns";
import { Request, Response } from "express";
import { AxiosRequestConfig, Method, AxiosError } from "axios";
import FormData from "form-data";
import { getRequestPath } from "../utils/utils";
import { apiPrefix } from "./constant";

export class RequestUtil {
  private ctx: GlobalContext;

  constructor(ctx: GlobalContext) {
    this.ctx = ctx;
  }

  public parseRequest(req: Request): AxiosRequestConfig {
    const { body, query, method, headers, path } = req;
    const { config } = this.ctx;
    const passedHeaders = {
      ...headers,
      referer: (headers.referer || "")
        .replace(/^https?:\/\/.*:\d+/, config.target)
        .replace(apiPrefix, ""),
      origin: config.target,
      host: config.target.replace(/^https?:\/\//, ""),
      // host: (headers.origin as string).replace(/^https?:\/\//, ''),
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
    };

    let data;
    if (
      headers["content-type"] &&
      headers["content-type"].match("application/x-www-form-urlencoded")
    ) {
      data = this.changeToFormData(body);
    } else if (
      headers["content-type"] &&
      headers["content-type"].match("multipart/form-data")
    ) {
      const data = new FormData();
      for (const key in body) {
        data.append(key, body[key]);
      }
    } else {
      data = body;
    }
    const parsedConfig: AxiosRequestConfig = {
      url: `${config.target}${getRequestPath(path)}`,
      method: method as Method,
      headers: passedHeaders,
      params: query,
      data,
      withCredentials: true,
      maxRedirects: 0,
      validateStatus: (status): boolean =>
        (status > 100 && status < 300) || status === 302,
    };
    if (binaryPattern.test(req.path)) {
      parsedConfig.responseType = "arraybuffer";
    }
    return parsedConfig;
  }

  public processResponseError(
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
    if (this.ctx.config.cacheStatic && staticPattern.test(request.path)) {
      response.status(200);
      response.sendFile(this.ctx.file.getFilePath(request.path, true));
      return;
    }
    // this.getResponseFromHistory(request, response, requestConfig, storagePath);
    response.status(404);
    response.send();
  }
  // TODO: 支持从定制化目录加载文件
  public async getResponseFromHistory(
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
      const transformedData = this.ctx.pluginApi.applyTransformer(data);
      response.send(transformedData);
      return;
    }
    response.status(404);
    response.send();
  }

  public assignHeadersToResponse(headers: any, response: Response): void {
    for (const key in headers) {
      let value: string = headers[key];
      if (key === "location") {
        const loc = value.replace(
          this.ctx.config.target,
          `http://localhost:${this.ctx.config.workPort}${apiPrefix}`
        );
        value = loc;
      }
      response.header(key, value);
    }
  }

  public changeToFormData(obj = {} as any): string {
    let result = "";

    for (const key in obj) {
      result += `${key}=${encodeURIComponent(obj[key])}&`;
    }
    result = result.slice(0, result.length - 1);
    return result;
  }
}
