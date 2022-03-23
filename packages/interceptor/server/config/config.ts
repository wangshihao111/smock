import { ProxyConfig } from "../utils/file-util";

export const defaultConfig: ProxyConfig = {
  cwd: process.cwd(),
  target: "http://hzero-backend.open-front.hand-china.com",
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
