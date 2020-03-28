import { ProxyConfig } from '../utils/file-util';

export const defaultConfig: ProxyConfig = {
  target: 'http://localhost:4000',
  workDir: '.smock',
  workPort: 10011,
  matchRegexp: /.*/,
  cacheStatic: true,
  pathIgnore: {
    query: [],
    body: []
  },
  plugins: []
};
