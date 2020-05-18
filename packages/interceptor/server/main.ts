import { GlobalContext } from "./utils/context-util";
import { UIController } from "./controllers/ui.controller";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import path, { resolve } from "path";
import { ProxyServerController } from "./controllers/proxy-server.controller";
import { multipartMiddleware } from "./middlewares/multipart.middleware";
import { applyCors } from "./middlewares/cors.middleware";
import chalk from "chalk";
import serveStatic from "@smock/utils/lib/serveStatic";
import { Hooks } from "./utils/plugin-api";
import { apiPrefix } from "./utils/constant";
import { initConfigFile } from "./utils/utils";

function applyBaseMiddleware(app: Application): void {
  app.use(applyCors);
  app.use(bodyParser.raw());
  app.use(bodyParser.text());
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(multipartMiddleware);
  app.use(express.static(path.resolve(__dirname, "../dist")));
}

export function createExpressMiddleware(port?: number) {
  // 初始化配置文件
  initConfigFile();
  // Create a universal context
  const ctx = new GlobalContext({} as Application, port);
  const instance = new ProxyServerController(ctx);
  const uiController = new UIController(ctx);
  ctx.pluginApi.emit(Hooks.CREATED);
  const _port = port || ctx.config.workPort;
  console.log(
    chalk.green(`拦截器服务运行在：http://127.0.0.1:${_port}${apiPrefix}`)
  );
  console.log(
    chalk.green(
      `你可以在浏览器打开此地址操作GUI：http://127.0.0.1:${_port}/__interceptor`
    )
  );
  const staticMiddleware = serveStatic(resolve(__dirname, "../dist"), {
    basePath: "/__interceptor",
  });
  const interceptorMiddleware = instance.asMiddleware();
  const uiMiddleware = uiController.asMiddleware();
  const middleware = (request: Request, response: Response, next: any) => {
    const requestPath = request.path || "";
    if (requestPath.startsWith("/__interceptor")) {
      staticMiddleware(request, response, next);
    } else if (requestPath.startsWith("/__ui_api")) {
      uiMiddleware(request, response, next);
    } else {
      interceptorMiddleware(request, response, next);
      // next();
    }
  };
  return { middleware, ctx };
}

function start(port?: number): void {
  const app = express();
  applyBaseMiddleware(app);
  // Create a universal context
  // const ctx = new GlobalContext(app, port);
  // const proxyServer = new ProxyServerController(ctx);
  // const uiController = new UIController(ctx);
  // uiController.run();
  // proxyServer.run();
  const { middleware, ctx } = createExpressMiddleware(port);
  app.use(middleware);
  app.listen(ctx.config.workPort);
}

export default start;
