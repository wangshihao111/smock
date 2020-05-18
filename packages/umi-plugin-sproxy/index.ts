// import { IApi } from "@umijs/types";
import startProxy from '@smock/interceptor/lib/main';

module.exports = (api) => {
  if (api.env === "development" && !process.env.NO_INTERCEPTOR) {
    if (!(global as any)['__smock/proxy']) {
      startProxy();
      (global as any)['__smock/proxy'] = true;
    }
  }
};
