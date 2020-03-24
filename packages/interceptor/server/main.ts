import { UIController } from './controllers/ui.controller';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { ProxyServer } from './controllers/proxy-server';
import { multipartMiddleware } from './middlewares/multipart.middleware';
import { applyCors } from './middlewares/cors.middleware';

function start (port = 5000): void {
  const app = express();
  app.use(applyCors);
  app.use(bodyParser.raw());
  app.use(bodyParser.text());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(multipartMiddleware);
  app.use(express.static(path.resolve(__dirname, '../dist')))
  const proxyServer = new ProxyServer(app, port);
  const uiController = new UIController(app);
  uiController.run();
  proxyServer.run();
  app.listen(port, () => {
    console.log('Interceptor app running at: http://localhost:' + port);
  });
}

export default start;
