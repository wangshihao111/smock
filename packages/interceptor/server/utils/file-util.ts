import {
  stat, readJSON, writeJSON, mkdir, readJSONSync, readJson, readJsonSync, writeJSONSync
} from 'fs-extra';
import { AxiosRequestConfig } from 'axios';
import path from 'path';
import { RequestUtil } from './request-util';

/**

  存储结构
  // user-message
  {
    [hash]: {Response}
  }

 */

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
}

export const defaultConfig: ProxyConfig = {
  target: 'http://localhost:4000',
  workDir: '.api-proxy',
  workPort: 10011
};

export class FileUtil {
  private static cwd: string;

  private static config: ProxyConfig;

  public static getFileName (url: string): string {
    // const str = url.split('?')[0];
    // return str.replace(/[\\/?:]/g, '-');
    return encodeURIComponent(url);
  }

  public static loadConfig (): ProxyConfig {
    this.cwd = process.cwd();
    const configFilePath = path.resolve(this.cwd, 'api-proxy.json');
    try {
      const config = readJSONSync(configFilePath);
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

  public static async addRequestLog (path: string, req: AxiosRequestConfig, res: StoredRequest): Promise<void> {
    const key = RequestUtil.getUniqueKeyFromRequest(req);
    try {
      const json = await readJSON(path);
      if (json) {
        writeJSON(path, { ...json, [key]: {request: {params: req.params, body: req.data}, response: res} }, { spaces: 2 });
      }
    } catch (error) {
      writeJSON(path, { [key]: {request: {params: req.params, body: req.data}, response: res} }, { spaces: 2 });
    }
  }

  public static async getRequestLog (path: string, req: AxiosRequestConfig): Promise<any> {
    const key = RequestUtil.getUniqueKeyFromRequest(req);
    try {
      const json = await readJSON(path);
      if (json) {
        return json[key];
      }
    } catch (error) {
      return undefined;
    }
  }

  public static getFilePath (url: string): string {
    const fileName = this.getFileName(url);
    return path.resolve(this.cwd, `${this.config.workDir}/history/${fileName}.json`);
  }

  public static async initFolder (): Promise<void> {
    const config = (this.config = this.loadConfig());
    const rootDir = path.resolve(process.cwd(), config.workDir);
    const historyDir = path.resolve(rootDir, 'history');
    try {
      const fldStat = await stat(rootDir);
      if (!fldStat.isDirectory()) {
        await mkdir(rootDir);
      }
    } catch (error) {
      await mkdir(rootDir);
    }
    try {
      const fldStat = await stat(historyDir);
      if (!fldStat.isDirectory()) {
        await mkdir(historyDir);
      }
    } catch (error) {
      await mkdir(historyDir);
    }
    const settingFile = path.resolve(rootDir, 'settings.json');
    try {
      const json = await readJson(settingFile);
    } catch(e) {
      writeJSON(settingFile, {});
    }
  }

  public static getSettings() {
    return readJsonSync(path.resolve(this.cwd, this.config.workDir, 'settings.json'));
  }

  public static setSettings(json: any) {
    return writeJSONSync(path.resolve(this.cwd, this.config.workDir, 'settings.json'), json, {spaces: 2});
  }
}
