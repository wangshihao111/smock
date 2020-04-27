import { createExpressMiddleware } from "@smock/mock/lib/server/server";

module.exports = (api) => {
  if (api.env === 'development') {
    api.addBeforeMiddewares(() => {
      return createExpressMiddleware(api.getPort());
    });
  }
};
