import { GlobalContext, ScopedContext } from './context-util';
import { AxiosResponse } from 'axios';
import { RequestHandler } from 'express';

export enum Hooks {
  BEFORE_REQUEST = 'beforeRequestHooks',
  AFTER_SEND = 'afterSend',
}

export interface TransformerFunc {
  (body: AxiosResponse): void;
}

export interface HookParamFunc {
  (globalCtx: GlobalContext, scopedCtx: ScopedContext): void;
}

export class PluginApi {
  private ctx: GlobalContext;
  private controllers: Array<RequestHandler>;
  private transformer: Array<TransformerFunc>;

  private [Hooks.BEFORE_REQUEST]: Array<HookParamFunc> = [];
  private [Hooks.AFTER_SEND]: Array<HookParamFunc> = [];

  constructor (ctx: GlobalContext) {
    this.ctx = ctx;
  }

  public registerController (
    creator: (ctx: GlobalContext) => RequestHandler
  ): void {
    this.controllers.push(creator(this.ctx));
  }

  public transformResponse (transformer: TransformerFunc): void {
    this.transformer.push(transformer);
  }

  public onBeforeRequest (handler: HookParamFunc): void {
    this[Hooks.BEFORE_REQUEST].push(handler);
  }

  public onAfterSend (handler: HookParamFunc): void {
    this[Hooks.AFTER_SEND].push(handler);
  }

  public triggerHook (hook: Hooks, scopedContext: ScopedContext): void {
    this[hook].forEach((func) => func(this.ctx, scopedContext));
  }
}
