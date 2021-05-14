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
  readJSONSync,
  statSync,
  mkdirSync,
} from "fs-extra";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import path from "path";
import hash from "object-hash";
import { defaultConfig } from "../config/config";
import { initConfigFile } from "./utils";

async function readJsonFile(file: string): Promise<any> {
  try {
    return await readJSON(file);
  } catch (error) {
    return undefined;
  }
}

export interface StoredRequest {
  path: string;
  status: number;
  data: any;
  headers: Headers;
}

export interface ProxyConfig {
  cwd?: string;
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
  private config: any;

  constructor(ctx: GlobalContext) {
    this.ctx = ctx;
    this.config = this.loadConfig();
    this.initFolder();
  }

  public getFileName(url: string): string {
    return encodeURIComponent(url);
    // return url.replace(/(\\|\/|\:)/g, '_');
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
    const readConfig = (dir = ""): ProxyConfig | false => {
      try {
        const configPath = path.resolve(process.cwd(), dir, ".smockrc.js");
        const conf = require(configPath) as ProxyConfig;
        delete require.cache[configPath];
        this.ctx.configFilePath = configPath;
        return conf;
      } catch (error) {
        return false;
      }
    };
    let config;
    config = readConfig();

    if (!config) {
      config = readConfig("../");
    }
    if (!config) {
      config = readConfig("../../");
    }
    if (!config) {
      initConfigFile();
      this.ctx.configFilePath = process.cwd();
    }
    return {
      ...defaultConfig,
      ...((config as ProxyConfig) || {}),
    } as ProxyConfig;
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
        await writeJSON(
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
      await writeJSON(
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
  // 获取本地缓存：优先从customize文件夹获取
  public async getRequestLog(
    path: string,
    req: AxiosRequestConfig
  ): Promise<any> {
    const key = this.getUniqueKeyFromRequest(req, path);
    const filePath = this.getFilePath(path);
    const customizePath = this.getFilePath(path, false, true);

    const customizeJson = await readJsonFile(customizePath);
    let result;
    if (customizeJson && customizeJson[key]) {
      result = customizeJson[key];
    } else {
      const json = await readJsonFile(filePath);
      result = json && json[key];
    }
    return result;
  }

  public getFilePath(
    url: string,
    asset?: boolean,
    customize?: boolean
  ): string {
    const fileName = this.getFileName(url);
    let dir = "history";
    if (asset) dir = "static";
    if (customize) dir = "customize";

    return path.resolve(
      this.ctx.cwd,
      `${this.ctx.config.workDir}/${dir}/${fileName}${asset ? "" : ".json"}`
    );
  }

  public getOneHistory(api: string, intercept?: boolean): any {
    const path = this.getFilePath(api);
    const customizePath = this.getFilePath(api, false, true);
    let result;
    if (intercept) {
      try {
        result = readJsonSync(customizePath);
      } catch (error) {
        result = readJSONSync(path);
      }
    } else {
      result = readJSONSync(path);
    }
    return result;
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

  // 更改本地缓存后将其放入customize文件夹
  public async updateRequestLog(data: any): Promise<void> {
    const { path, key, response } = data;
    try {
      const filePath = this.getFilePath(path);
      const targetPath = this.getFilePath(path, false, true);
      const json = await readJSON(filePath);
      if (json) {
        const target = json[key];
        await writeJSON(
          targetPath,
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

  public initFolder() {
    const { config } = this;
    const rootDir = path.resolve(process.cwd(), config.workDir);
    const historyDir = path.resolve(rootDir, "history");
    const staticDir = path.resolve(rootDir, "static");
    const customizeDir = path.resolve(rootDir, "customize");
    const dirs = [rootDir, historyDir, staticDir, customizeDir];
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      try {
        const fldStat = statSync(dir);
        if (!fldStat.isDirectory()) {
          mkdirSync(dir);
        }
      } catch (error) {
        mkdirSync(dir);
      }
    }
    const settingFile = path.resolve(rootDir, "settings.json");
    try {
      readJsonSync(settingFile);
    } catch (e) {
      writeJSONSync(settingFile, {});
    }
  }

  public getSettings(): DB {
    return readJsonSync(
      path.resolve(this.ctx.cwd, this.ctx.config.workDir, "settings.json")
    );
  }

  public setSettings(json: any): void {
    return writeJSONSync(
      path.resolve(this.ctx.cwd, this.config.workDir, "settings.json"),
      json,
      { spaces: 2 }
    );
  }
}
