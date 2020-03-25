import { UIController } from './controllers/ui.controller';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { ProxyServer } from './controllers/proxy-server';
import { multipartMiddleware } from './middlewares/multipart.middleware';
import { applyCors } from './middlewares/cors.middleware';

function start (port: number): void {
  const app = express();
  app.use(applyCors);
  app.use(bodyParser.raw());
  app.use(bodyParser.text());
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(multipartMiddleware);
  app.use(express.static(path.resolve(__dirname, '../dist')))
  const proxyServer = new ProxyServer(app, port);
  const uiController = new UIController(app);
  uiController.run();
  const workPort = proxyServer.run();
  app.listen(workPort, () => {
    console.log('Interceptor app running at: http://localhost:' + workPort);
  });
}

export default start;
