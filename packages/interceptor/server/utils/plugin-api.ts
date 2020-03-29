import { GlobalContext, ScopedContext } from './context-util';
import { AxiosResponse } from 'axios';
import { RequestHandler } from 'express';

export enum Hooks {
  BEFORE_REQUEST = 'beforeRequestHooks',
  AFTER_SEND = 'afterSend',
  CREATED = 'created',
}

export interface TransformerFunc {
  (body: AxiosResponse): void;
}

export interface HookParamFunc {
  (globalCtx: GlobalContext, scopedCtx?: ScopedContext): void;
}

export interface PluginAPiFunc {
  (api: PluginApi): void;
}

export class PluginApi {
  private ctx: GlobalContext;
  middleware: Array<RequestHandler> = [];
  transformer: Array<TransformerFunc> = [];

  private [Hooks.BEFORE_REQUEST]: Array<HookParamFunc> = [];
  private [Hooks.AFTER_SEND]: Array<HookParamFunc> = [];
  private [Hooks.CREATED]: Array<HookParamFunc> = [];

  constructor (ctx: GlobalContext) {
    this.ctx = ctx;
    this.initPluginApi(ctx);
  }

  public registerMiddleware (
    creator: (ctx: GlobalContext) => RequestHandler
  ): void {
    this.middleware.push(creator(this.ctx));
  }

  public transformResponse (transformer: TransformerFunc): void {
    this.transformer.push(transformer);
  }

  public emit (hook: Hooks, scopedContext?: ScopedContext): void {
    this[hook].forEach((func) => func(this.ctx, scopedContext));
  }

  public on (hook: Hooks, handler: HookParamFunc): void {
    this[hook].push(handler);
  }

  /**
   * 初始化插件
   * @param ctx { PluginApi }
   */
  public initPluginApi (ctx: GlobalContext): void {
    const {
      config: { plugins = [] }
    } = ctx;
    plugins.forEach((pluginFun) => {
      if (typeof pluginFun === 'function') {
        pluginFun(this);
      }
    });
    this.middleware.forEach((m) => ctx.app.use(m));
  }
}
