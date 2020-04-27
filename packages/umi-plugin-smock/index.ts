import { IApi } from "umi";
import { createExpressMiddleware } from "@smock/mock/lib/server/server";

module.exports = (api: IApi) => {
  if (api.env === 'development') {
    api.addBeforeMiddewares(() => {
      return createExpressMiddleware(api.getPort());
    });
  }
};
