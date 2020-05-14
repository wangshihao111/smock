// import { IApi } from "@umijs/types";
import startProxy from '@smock/interceptor/lib/main';

module.exports = (api) => {
  if (api.env === "development" && !process.env.NO_PROXY) {
    const port = api.args.port;
    startProxy(Number(port));
  }
};
