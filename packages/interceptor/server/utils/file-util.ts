import { utf8Pattern, binaryPattern } from './patterns';
import { DbUtil } from "./db-util";
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
import { RequestUtil } from "./request-util";

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
    query: string[],
    body: string[]
  };
}

export const defaultConfig: ProxyConfig = {
  target: "http://localhost:4000",
  workDir: ".smock",
  workPort: 10011,
  matchRegexp: /^.*$/,
  cacheStatic: true,
  pathIgnore: {
    query: [],
    body: []
  }
};

export class FileUtil {
  private static cwd: string;

  private static config: ProxyConfig;

  public static getFileName(url: string): string {
    // const str = url.split('?')[0];
    // return str.replace(/[\\/?:]/g, '-');
    return encodeURIComponent(url);
  }

  public static loadConfig(): ProxyConfig {
    this.cwd = process.cwd();
    const configFilePath = path.resolve(this.cwd, ".smockrc.js");
    try {
      const config = require(configFilePath);
      return {
        ...defaultConfig,
        ...(config as ProxyConfig)
      };
    } catch (e) {
      return {
        ...defaultConfig
      } as ProxyConfig;
    }
  }

  public static async addRequestLog(
    path: string,
    req: AxiosRequestConfig,
    res: StoredRequest,
  ): Promise<void> {
    const filePath = this.getFilePath(path);
    const key = RequestUtil.getUniqueKeyFromRequest(req, path);
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
              response: res
            }
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
            response: res
          }
        },
        { spaces: 2 }
      );
    }
  }

  public static async getRequestLog(
    path: string,
    req: AxiosRequestConfig,
  ): Promise<any> {
    const key = RequestUtil.getUniqueKeyFromRequest(req, path);
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

  public static getFilePath(url: string, asset?: boolean): string {
    const fileName = this.getFileName(url);
    return path.resolve(
      this.cwd,
      `${this.config.workDir}/${!asset ? 'history' : 'static'}/${fileName}${asset ? '' : '.json'}`
    );
  }

  public static getOneHistory(api: string) {
    const path = this.getFilePath(api);
    return readJsonSync(path);
  }

  public static deleteOneLog(api: string) {
    const path = this.getFilePath(api);
    removeSync(path);
    const db = DbUtil.getDb();
    const { apiList = [] as string[], interceptList = [] as string[] } = db as {
      apiList: string[];
      interceptList: string[];
    };
    const apiIndex = apiList.indexOf(api);
    const intepIndex = interceptList.indexOf(api);
    if (apiIndex > -1) apiList.splice(apiIndex, 1);
    if (intepIndex > -1) interceptList.splice(intepIndex, 1);
    DbUtil.set("apiList", apiList);
    DbUtil.set("interceptList", interceptList);
  }

  public static async updateRequestLog(data: any) {
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
            }
          },
          { spaces: 2 }
        );
      }
    } catch (error) {
      throw new Error("failed");
    }
  }

  public static async storageStatic(_path: string, res: AxiosResponse) {
    const filePath = path.resolve(this.cwd, `${this.config.workDir}/static/${this.getFileName(_path)}`);
    if (utf8Pattern.test(_path)) {
      await writeFile(filePath, res.data);
    }
    if (binaryPattern.test(_path)) {
      await writeFile(filePath, res.data, 'binary');
    }
  }

  public static async initFolder(): Promise<void> {
    const config = (this.config = this.loadConfig());
    const rootDir = path.resolve(process.cwd(), config.workDir);
    const historyDir = path.resolve(rootDir, "history");
    const staticDir = path.resolve(rootDir, 'static');
    const dirs = [rootDir, historyDir, staticDir]
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
      const json = await readJson(settingFile);
    } catch (e) {
      writeJSON(settingFile, {});
    }
  }

  public static getSettings() {
    return readJsonSync(
      path.resolve(this.cwd, this.config.workDir, "settings.json")
    );
  }

  public static setSettings(json: any) {
    return writeJSONSync(
      path.resolve(this.cwd, this.config.workDir, "settings.json"),
      json,
      { spaces: 2 }
    );
  }
}
