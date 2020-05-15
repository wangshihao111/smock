import { createExpressMiddleware } from "@smock/mock/lib/server/server";

module.exports = (api) => {
  
  if (api.env === 'development' && !process.env.NO_SMOCK) {
    api.addBeforeMiddewares(() => {
      return createExpressMiddleware(api.getPort());
    });
  }
};
