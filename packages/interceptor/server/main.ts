import { GlobalContext } from "./utils/context-util";
import { UIController } from "./controllers/ui.controller";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import path, { resolve } from "path";
import { ProxyServerController } from "./controllers/proxy-server.controller";
import { multipartMiddleware } from "./middlewares/multipart.middleware";
import { applyCors } from "./middlewares/cors.middleware";
import chalk from "chalk";
import { debounce } from "lodash";
import serveStatic from "@smock/utils/lib/serveStatic";
import { Hooks } from "./utils/plugin-api";
import { apiPrefix } from "./utils/constant";
import fs from "fs-extra";
import compress from "compression";

function applyBaseMiddleware(app: Application): void {
  app.use(applyCors);
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  app.use(compress());
  app.use(bodyParser.raw());
  app.use(bodyParser.text());
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(multipartMiddleware);
  app.use(express.static(path.resolve(__dirname, "../dist")));
}

export function createExpressMiddleware(port?: number, app?: Application) {
  // Create a universal context
  let ctx = new GlobalContext(app as Application, port);
  let instance = new ProxyServerController(ctx);
  let uiController = new UIController(ctx);
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
  let staticMiddleware = serveStatic(resolve(__dirname, "../dist"), {
    basePath: "/__interceptor",
  });
  let interceptorMiddleware = instance.asMiddleware();
  let uiMiddleware = uiController.asMiddleware();

  const watcher = (callback: Function) => {
    fs.watch(
      ctx.configFilePath,
      debounce(() => {
        callback();
      }, 1000)
    );
  };
  watcher(() => {
    ctx = new GlobalContext(app as Application, port);
    instance = new ProxyServerController(ctx);
    uiController = new UIController(ctx);
    ctx.pluginApi.emit(Hooks.CREATED);
    staticMiddleware = serveStatic(resolve(__dirname, "../dist"), {
      basePath: "/__interceptor",
    });
    interceptorMiddleware = instance.asMiddleware();
    uiMiddleware = uiController.asMiddleware();

    console.log(
      chalk.yellowBright(".smockrc.js配置文件已改变，成功刷新服务。")
    );
  });
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
  const { middleware, ctx } = createExpressMiddleware(port, app) as {
    middleware: any;
    ctx: GlobalContext;
  };
  app.use(middleware);
  app.listen(ctx.config.workPort);
}

export default start;
