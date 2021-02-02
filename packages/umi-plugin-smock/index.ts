import { createExpressMiddleware } from "@smock/mock/lib/server/server";
import { applyCors } from "@smock/mock/lib/server/middlewares/cors.middleware";
import bodyParser from 'body-parser';

module.exports = (api) => {
  if (process.env.NO_SMOCK === 'true') {
    return;
  }
  if (process.env.NODE_ENV === 'development') {
    api.addBeforeMiddewares(() => applyCors)
    api.addBeforeMiddewares(() => bodyParser.text())
    api.addBeforeMiddewares(() => bodyParser.json())
    api.addBeforeMiddewares(() => bodyParser.urlencoded({ extended: true }))

    api.addBeforeMiddewares(() => {
      return createExpressMiddleware(api.getPort());
    });
  }
};
