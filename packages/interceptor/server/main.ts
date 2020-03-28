import { GlobalContext } from './utils/context-util';
import { UIController } from './controllers/ui.controller';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { ProxyServer } from './controllers/proxy-server';
import { multipartMiddleware } from './middlewares/multipart.middleware';
import { applyCors } from './middlewares/cors.middleware';
import chalk from 'chalk';

function applyBaseMiddleware (app: Application): void {
  app.use(applyCors);
  app.use(bodyParser.raw());
  app.use(bodyParser.text());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(multipartMiddleware);
  app.use(express.static(path.resolve(__dirname, '../dist')));
}

function start (port = 10011): void {
  const app = express();
  applyBaseMiddleware(app);
  // Create a universal context
  const ctx = new GlobalContext(app, port);
  const proxyServer = new ProxyServer(ctx);
  const uiController = new UIController(ctx);
  uiController.run();
  proxyServer.run();
  app.listen(ctx.config.workPort, () => {
    console.log(
      chalk.yellow('Interceptor app running at:') + chalk.greenBright(` http://127.0.0.1:${ctx.config.workPort}`)
    );
  });
}

export default start;
