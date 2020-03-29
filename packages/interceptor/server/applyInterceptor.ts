import { Application } from 'express';
import bodyParser from 'body-parser';
import { ProxyServer } from './controllers/proxy-server';
import { multipartMiddleware } from './middlewares/multipart.middleware';
import { applyCors } from './middlewares/cors.middleware';
import { GlobalContext } from './utils/context-util';

export function applyInterceptor (app: Application, port: number): void {
  const ctx = new GlobalContext(app, port);
  const proxyServer = new ProxyServer(ctx);
  proxyServer.run();
}

export function applyParsers (app: Application): void {
  app.use(applyCors);
  app.use(bodyParser.raw());
  app.use(bodyParser.text());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(multipartMiddleware);
}
