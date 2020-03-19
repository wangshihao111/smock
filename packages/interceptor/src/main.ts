import express from 'express';
import {ProxyServer} from './controllers/proxy-server'
import bodyParser from 'body-parser';
import { multipartMiddleware } from './middlewares/multipart.middleware';

function main() {
  const app = express();
  app.use(bodyParser.raw());
  app.use(bodyParser.text());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(multipartMiddleware)
  const proxyServer = new ProxyServer(app);
  const port = proxyServer.run();
  app.listen(port, () => {
    console.log('app running at: http://localhost:10011', )
  });
}

main()

export default main;
