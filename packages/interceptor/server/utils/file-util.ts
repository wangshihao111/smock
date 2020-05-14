import { PluginAPiFunc } from "./plugin-api";
import { GlobalContext } from "./context-util";
import { utf8Pattern, binaryPattern } from "./patterns";
import { DB } from "./db-util";
import {
  stat,
  readJSON,
  writeJSON,
  mkdir,
  readJson,
  readJsonSync,
  writeJSONSync,
  removeSync,
  writeFile,
} from "fs-extra";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import path from "path";
import hash from "object-hash";
import { defaultConfig } from "../config/config";

export interface StoredRequest {
  path: string;
  status: number;
  data: any;
  headers: Headers;
}

export interface ProxyConfig {
  target: string;
  workDir: string;
  workPort: number;
  matchRegexp: RegExp;
  cacheStatic: boolean;
  pathIgnore: {
    query: string[];
    body: string[];
  };
  plugins: PluginAPiFunc[];
}

export class FileUtil {
  private ctx: GlobalContext;

  constructor(ctx: GlobalContext) {
    this.ctx = ctx;
  }

  public getFileName(url: string): string {
    return encodeURIComponent(url);
  }

  public getUniqueKeyFromRequest(
    config: AxiosRequestConfig,
    currentPath: string
  ): string {
    const { data, params, method } = config;
    const obj = { data, params, method };
    const {
      pathIgnore: { query = [], body = [] },
    } = this.ctx.config;
    if (query.includes(currentPath)) {
      delete obj.params;
    }
    if (body.includes(currentPath)) {
      delete obj.data;
    }
    return hash(obj);
  }

  public loadConfig(): ProxyConfig {
    const configFilePath = path.resolve(this.ctx.cwd, ".smockrc.js");
    try {
      // eslint-disable-next-line
      const config = require(configFilePath);
      return {
        ...defaultConfig,
        ...(config as ProxyConfig),
      };
    } catch (e) {
      console.error("Load config error", e);
      return {
        ...defaultConfig,
      } as ProxyConfig;
    }
  }

  public async addRequestLog(
    path: string,
    req: AxiosRequestConfig,
    res: StoredRequest
  ): Promise<void> {
    const filePath = this.getFilePath(path);
    const key = this.getUniqueKeyFromRequest(req, path);
    try {
      const json = await readJSON(filePath);
      if (json) {
        writeJSON(
          filePath,
          {
            ...json,
            [key]: {
              method: req.method,
              request: { params: req.params, body: req.data },
              response: res,
            },
          },
          { spaces: 2 }
        );
      }
    } catch (error) {
      writeJSON(
        filePath,
        {
          [key]: {
            request: { params: req.params, body: req.data },
            response: res,
          },
        },
        { spaces: 2 }
      );
    }
  }

  public async getRequestLog(
    path: string,
    req: AxiosRequestConfig
  ): Promise<any> {
    const key = this.getUniqueKeyFromRequest(req, path);
    const filePath = this.getFilePath(path);
    try {
      const json = await readJSON(filePath);
      if (json) {
        return json[key];
      }
    } catch (error) {
      return undefined;
    }
  }

  public getFilePath(url: string, asset?: boolean): string {
    const fileName = this.getFileName(url);
    return path.resolve(
      this.ctx.cwd,
      `${this.ctx.config.workDir}/${!asset ? "history" : "static"}/${fileName}${
        asset ? "" : ".json"
      }`
    );
  }

  public getOneHistory(api: string): any {
    const path = this.getFilePath(api);
    return readJsonSync(path);
  }

  public deleteOneLog(api: string): void {
    const path = this.getFilePath(api);
    removeSync(path);
    const db = this.ctx.db.getDb();
    const { apiList = [] as string[], interceptList = [] as string[] } = db as {
      apiList: string[];
      interceptList: string[];
    };
    const apiIndex = apiList.indexOf(api);
    const intepIndex = interceptList.indexOf(api);
    if (apiIndex > -1) apiList.splice(apiIndex, 1);
    if (intepIndex > -1) interceptList.splice(intepIndex, 1);
    this.ctx.db.set("apiList", apiList);
    this.ctx.db.set("interceptList", interceptList);
  }

  public async updateRequestLog(data: any): Promise<void> {
    const { path, key, response } = data;
    try {
      const filePath = this.getFilePath(path);
      const json = await readJSON(filePath);
      if (json) {
        const target = json[key];
        await writeJSON(
          filePath,
          {
            ...json,
            [key]: {
              ...target,
              response,
            },
          },
          { spaces: 2 }
        );
      }
    } catch (error) {
      throw new Error("failed");
    }
  }

  public async storageStatic(_path: string, res: AxiosResponse): Promise<void> {
    const filePath = path.resolve(
      this.ctx.cwd,
      `${this.ctx.config.workDir}/static/${this.getFileName(_path)}`
    );
    if (utf8Pattern.test(_path)) {
      await writeFile(filePath, res.data);
    }
    if (binaryPattern.test(_path)) {
      await writeFile(filePath, res.data, "binary");
    }
  }

  public async initFolder(): Promise<void> {
    const { config } = this.ctx;
    const rootDir = path.resolve(process.cwd(), config.workDir);
    const historyDir = path.resolve(rootDir, "history");
    const staticDir = path.resolve(rootDir, "static");
    const dirs = [rootDir, historyDir, staticDir];
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      try {
        const fldStat = await stat(dir);
        if (!fldStat.isDirectory()) {
          await mkdir(dir);
        }
      } catch (error) {
        await mkdir(dir);
      }
    }
    const settingFile = path.resolve(rootDir, "settings.json");
    try {
      await readJson(settingFile);
    } catch (e) {
      writeJSON(settingFile, {});
    }
  }

  public getSettings(): DB {
    return readJsonSync(
      path.resolve(this.ctx.cwd, this.ctx.config.workDir, "settings.json")
    );
  }

  public setSettings(json: any): void {
    return writeJSONSync(
      path.resolve(this.ctx.cwd, this.ctx.config.workDir, "settings.json"),
      json,
      { spaces: 2 }
    );
  }
}
