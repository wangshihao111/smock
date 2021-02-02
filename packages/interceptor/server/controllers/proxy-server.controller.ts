import { GlobalContext, ScopedContext } from "./../utils/context-util";
import { staticPattern } from "./../utils/patterns";
import { RequestHandler, Response, Request } from "express";
import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import { RequestUtil } from "../utils/request-util";
import { AbstractController } from "../definitions/AbstractController";
import { Hooks } from "../utils/plugin-api";
import { Scheduler } from "../utils/Scheduler";

export class ProxyServerController extends AbstractController {
  private requestUtil: RequestUtil;
  private scheduler: Scheduler;

  constructor(ctx: GlobalContext) {
    super(ctx);
    this.requestMiddleware = this.requestMiddleware.bind(this);
    this.requestUtil = new RequestUtil(ctx);
    this.scheduler = new Scheduler();
  }

  private requestMiddleware(req: Request, res: Response, next: any): void {
    const scopedCtx = new ScopedContext(req, res);
    this.ctx.pluginApi.emit(Hooks.BEFORE_REQUEST, scopedCtx);

    const db = this.ctx.db.getDb();
    const requestConfig: AxiosRequestConfig = this.requestUtil.parseRequest(
      req
    );
    const interceptList = db.interceptList || [];
    // 如果是拦截目标，走本地缓存
    if (this.ctx.db.hasArrayStringItem(interceptList, req.path)) {
      this.requestUtil.getResponseFromHistory(
        req,
        res,
        requestConfig,
        req.path
      );
    } else {
      axios(requestConfig)
        .then((axiosRes: AxiosResponse) => {
          const { status, headers, data } = axiosRes;
          this.requestUtil.assignHeadersToResponse(headers, res);
          // 正则匹配到的将缓存到本地
          if (
            this.ctx.config.matchRegexp.test(req.path) &&
            !staticPattern.test(req.path)
          ) {
            const logTask = async () => {
              await this.ctx.file.addRequestLog(req.path, requestConfig, {
                path: req.path,
                status,
                headers,
                data,
              });
            };
            (logTask as any).rand = Math.random();
            this.scheduler.addQueue(req.path, logTask);
          }
          if (this.ctx.config.cacheStatic && staticPattern.test(req.path)) {
            this.ctx.file.storageStatic(req.path, axiosRes);
          }
          // 只记录非静态资源的路径,存放进db
          if (!staticPattern.test(req.path)) {
            const apiList = db.apiList || [];
            this.ctx.db.addStringArrayItem(apiList, req.path);
            this.ctx.db.set("apiList", apiList);
          }
          const transformedData = this.ctx.pluginApi.applyTransformer(data);
          res.status(status).send(transformedData);
        })
        .catch((e: AxiosError) => {
          this.requestUtil.processResponseError(e, req, res, requestConfig);
        });
      this.ctx.pluginApi.emit(Hooks.AFTER_SEND, scopedCtx);
    }
  }

  public asMiddleware(): RequestHandler {
    // this.ctx.file.initFolder();
    return this.requestMiddleware.bind(this);
  }

  public run(): void {
    // this.ctx.file.initFolder();
    this.ctx.app.use(this.requestMiddleware);
  }
}
