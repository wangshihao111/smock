import express from 'express';
import bodyParser from 'body-parser';
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
  const proxyServer = new ProxyServer(app, port);
  proxyServer.run();
  app.listen(port, () => {
    console.log('Interceptor app running at: http://localhost:' + port);
  });
}

export default start;
