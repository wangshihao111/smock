import { GlobalContext } from "./utils/context-util";
import { UIController } from "./controllers/ui.controller";
import express, { Application } from "express";
import bodyParser from "body-parser";
import path from "path";
import { ProxyServerController } from "./controllers/proxy-server.controller";
import { multipartMiddleware } from "./middlewares/multipart.middleware";
import { applyCors } from "./middlewares/cors.middleware";
import chalk from "chalk";
import { Hooks } from "./utils/plugin-api";

function applyBaseMiddleware(app: Application): void {
  app.use(applyCors);
  app.use(bodyParser.raw());
  app.use(bodyParser.text());
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(multipartMiddleware);
  app.use(express.static(path.resolve(__dirname, "../dist")));
}

function start(port = 10011): void {
  const app = express();
  applyBaseMiddleware(app);
  // Create a universal context
  const ctx = new GlobalContext(app, port);
  const proxyServer = new ProxyServerController(ctx);
  const uiController = new UIController(ctx);
  uiController.run();
  proxyServer.run();
  ctx.pluginApi.emit(Hooks.CREATED);
  app.listen(ctx.config.workPort, () => {
    console.log(
      chalk.yellow("Interceptor app running at:") +
        chalk.greenBright(` http://127.0.0.1:${ctx.config.workPort}`)
    );
    console.log(chalk.gray("您可以打开此地址以进入可视化页面。"));
  });
}

export default start;
