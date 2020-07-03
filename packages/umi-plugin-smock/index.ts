import { createExpressMiddleware } from "@smock/mock/lib/server/server";

module.exports = (api) => {
  if (process.env.NO_SMOCK === 'true') {
    return;
  }
  if (api.env === 'development') {
    api.addBeforeMiddewares(() => {
      return createExpressMiddleware(api.getPort());
    });
  }
};
