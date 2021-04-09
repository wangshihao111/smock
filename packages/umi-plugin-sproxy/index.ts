// import { IApi } from "@umijs/types";
import startProxy from "@smock/interceptor/lib/main";
import { resolve } from "path";

const { argv } = process;

function isHzeroCLIDev() {
  return argv.some((str) => str.match("hzero-cli")) && argv.includes("start");
}

function isUmiCLIDev() {
  return argv.some((str) => str.match("umi")) && argv.includes("dev");
}

module.exports = (api) => {
  const { NO_INTERCEPTOR, NO_SPROXY } = process.env || {};

  if (NO_INTERCEPTOR === "true" || NO_SPROXY === "true") {
    return;
  }
  const isDev = isHzeroCLIDev() || isUmiCLIDev();
  if (api.env === "development" && isDev) {
    if (!(global as any)["__smock/proxy"]) {
      try {
        startProxy();
      } catch (error) {
        console.log(error);
      }
      (global as any)["__smock/proxy"] = true;
    }
    if (typeof api.onUISocket === "function") {
      api.onUISocket(async ({ action, failure, success, send }) => {
        if (action.type === "smock/sproxy-port") {
          const cwd = process.cwd();
          let port = 10011;
          const paths = [
            resolve(cwd, ".smockrc.js"),
            resolve(cwd, "../../smockrc.js"),
          ];
          for (let i = 0; i < paths.length; i++) {
            const p = paths[i];
            try {
              port = require(p).workPort;
              break;
            } catch (error) {}
          }
          success(port);
        }
      });
    }
  }
};
