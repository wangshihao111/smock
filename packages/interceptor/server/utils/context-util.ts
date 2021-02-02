import { PluginApi } from "./plugin-api";
import { FileUtil, ProxyConfig } from "./file-util";
import { DbUtil } from "./db-util";
import { Application, Request, Response } from "express";
import { resolve } from "path";

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
  public configFilePath: string;

  constructor(app: Application, port?: number) {
    this.app = app;
    this.cwd = process.cwd();
    this.file = new FileUtil(this);
    // 顺序很重要，这个赋值必须在loadConfig之前
    this.configFilePath = resolve(process.cwd(), ".smockrc.js");
    const config = this.file.loadConfig();
    if (config.cwd) {
      this.cwd = config.cwd;
    }
    this.config = { ...config, workPort: port || config.workPort || 10011 };
    this.db = new DbUtil(this);
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
