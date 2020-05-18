import { PluginApi } from "./plugin-api";
import { FileUtil, ProxyConfig } from "./file-util";
import { DbUtil } from "./db-util";
import { Application, Request, Response } from "express";

export interface GlobalContextInterface {
  app: Application;
  db: DbUtil;
  file: FileUtil;
  config: ProxyConfig;
  cwd: string;
  pluginApi: PluginApi;
}

export interface ScopedContextInterface {
  request: Request;
  response: Response;
}

export class GlobalContext implements GlobalContextInterface {
  public readonly app: Application;
  public readonly db: DbUtil;
  public readonly file: FileUtil;
  public readonly config: ProxyConfig;
  public readonly cwd: string;
  public readonly pluginApi: PluginApi;

  constructor(app: Application, port?: number) {
    this.app = app;
    this.cwd = process.cwd();
    this.db = new DbUtil(this);
    this.file = new FileUtil(this);
    const config = this.file.loadConfig();
    this.config = { ...config, workPort: port || config.workPort || 10011 };
    this.pluginApi = new PluginApi(this);
  }
}

export class ScopedContext implements ScopedContextInterface {
  request: Request;
  response: Response;

  constructor(req: Request, res: Response) {
    this.request = req;
    this.response = res;
  }
}

export function createScopedContext(
  request: Request,
  response: Response
): ScopedContext {
  return {
    request,
    response,
  } as ScopedContext;
}
