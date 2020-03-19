import { MockService } from './mock/mock.service';
import { ApiCorsService } from './mock/api-cors.service';
import { applyCors } from './middlewares/cors.middleware';
import bodyParser from 'body-parser'
import express, {Application} from 'express';
import {resolve} from 'path';

export default function createMock({
  host = 'localhost',
  port = 4000
}) {
  const app: Application = express();

  app.all('*', applyCors);
  app.use(bodyParser.text());
  app.use(bodyParser.json()); 
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(resolve(__dirname, '../../dist')))

  const mockInstance = new MockService(app, port, host);
  const apiCorsService = new ApiCorsService(app);

  mockInstance.init();
  apiCorsService.init();

  app.listen(port, host, () => {
    console.log(`Mock running at: http://${host}:${port}` );
  });
};
