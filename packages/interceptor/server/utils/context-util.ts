import { FileUtil, ProxyConfig } from './file-util';
import { DbUtil } from './db-util';
import { Application, Request, Response } from 'express';

export interface GlobalContextInterface {
  app: Application;
  db: DbUtil;
  file: FileUtil;
  config: ProxyConfig;
  cwd: string;
}

export interface ScopedContext {
  request: Request;
  response: Response;
}

export class GlobalContext implements GlobalContextInterface {
  public readonly app: Application;
  public readonly db: DbUtil;
  public readonly file: FileUtil;
  public readonly config: ProxyConfig;
  public readonly cwd: string;

  constructor (app: Application, port: number) {
    this.app = app;
    this.cwd = process.cwd();
    this.db = new DbUtil(this);
    this.file = new FileUtil(this);
    const config = this.file.loadConfig();
    this.config = { ...config, workPort: port || config.workPort };
  }
}

export function createScopedContext (
  request: Request,
  response: Response
): ScopedContext {
  return {
    request,
    response
  } as ScopedContext;
}
