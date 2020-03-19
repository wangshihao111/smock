import express from 'express';
import bodyParser from 'body-parser';
import { ProxyServer } from './controllers/proxy-server';
import { multipartMiddleware } from './middlewares/multipart.middleware';

function start (port: number): void {
  const app = express();
  app.use(bodyParser.raw());
  app.use(bodyParser.text());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(multipartMiddleware);
  const proxyServer = new ProxyServer(app);
  const p = port || proxyServer.run();
  app.listen(p, () => {
    console.log('app running at: http://localhost:10011');
  });
}

export default start;
