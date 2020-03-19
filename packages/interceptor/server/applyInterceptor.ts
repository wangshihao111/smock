import { Application } from 'express';
import bodyParser from 'body-parser';
import { ProxyServer } from './controllers/proxy-server';
import { multipartMiddleware } from './middlewares/multipart.middleware';
import { applyCors } from './middlewares/cors.middleware';

export function applyInterceptor (app: Application, port: number): void {
  const proxyServer = new ProxyServer(app, port);
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
