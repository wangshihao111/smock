// import { IApi } from "@umijs/types";
import startProxy from '@smock/interceptor/lib/main';

module.exports = (api) => {
  const {NO_INTERCEPTOR, NO_SPROXY} = process.env || {};
  
  if (NO_INTERCEPTOR === 'true' || NO_SPROXY=== 'true') {
    return;
  }
  if (api.env === "development") {
    if (!(global as any)['__smock/proxy']) {
      startProxy();
      (global as any)['__smock/proxy'] = true;
    }
  }
};
