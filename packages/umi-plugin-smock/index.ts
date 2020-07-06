import { createExpressMiddleware } from "@smock/mock/lib/server/server";
import bodyParser from 'body-parser';

module.exports = (api) => {
  if (process.env.NO_SMOCK === 'true') {
    return;
  }
  if (api.env === 'development') {
    api.addBeforeMiddewares(() => bodyParser.text())
    api.addBeforeMiddewares(() => bodyParser.json())
    api.addBeforeMiddewares(() => bodyParser.urlencoded({ extended: true }))

    api.addBeforeMiddewares(() => {
      return createExpressMiddleware(api.getPort());
    });
  }
};
