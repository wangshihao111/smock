import {
  stat, readJSON, writeJSON, mkdir, readJSONSync
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
    const str = url.split('?')[0];
    return str.replace(/[\\/?:]/g, '-');
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
        writeJSON(path, { ...json, [key]: res }, { spaces: 2 });
      }
    } catch (error) {
      writeJSON(path, { [key]: req }, { spaces: 2 });
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
    return path.resolve(this.cwd, `${this.config.workDir}/${fileName}.json`);
  }

  public static async initFolder (): Promise<void> {
    const config = (this.config = this.loadConfig());
    try {
      const fldStat = await stat(path.resolve(process.cwd(), config.workDir));
      if (!fldStat.isDirectory()) {
        await mkdir(path.resolve(process.cwd(), config.workDir));
      }
    } catch (error) {
      await mkdir(path.resolve(process.cwd(), config.workDir));
    }
  }
}
