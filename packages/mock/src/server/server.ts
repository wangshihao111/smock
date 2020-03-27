import bodyParser from 'body-parser';
import express, { Application } from 'express';
import { resolve } from 'path';
import { MockService } from './mock/mock.service';
import { ApiCorsService } from './mock/api-cors.service';
import { applyCors } from './middlewares/cors.middleware'
import chalk from 'chalk';

export default function createMock ({
  host = '0.0.0.0',
  port = 4000
}): void {
  const app: Application = express();

  app.all('*', applyCors);
  app.use(bodyParser.text());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(resolve(__dirname, '../../dist')));

  const mockInstance = new MockService(app, port, host);
  const apiCorsService = new ApiCorsService(app);

  mockInstance.init();
  apiCorsService.init();

  app.listen(port, host, () => {
    console.log(`${chalk.blue('Mock 服务运行在: ')}${chalk.green(`http://127.0.0.1:${port}`)}`);
    console.log(`${chalk.greenBright('您可以打开此地址以查看接口文档。')}`);
  });
}

export function runMock (app: Application, port, host): void {
  app.use(express.static(resolve(__dirname, '../../dist')));

  const mockInstance = new MockService(app, port, host);
  const apiCorsService = new ApiCorsService(app);
  mockInstance.init();
  apiCorsService.init();
}
