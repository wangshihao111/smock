import { ProxyConfig } from "../utils/file-util";

export const defaultConfig: ProxyConfig = {
  cwd: process.cwd(),
  target: "http://hzeroall.saas.hand-china.com/api",
  workDir: ".smock",
  workPort: 10011,
  matchRegexp: /.*/,
  cacheStatic: true,
  pathIgnore: {
    query: [],
    body: [],
  },
  plugins: [],
};
