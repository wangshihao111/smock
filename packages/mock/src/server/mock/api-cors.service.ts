import { Application, Request, Response } from 'express';
import axios from 'axios';

export class ApiCorsService {
  private app: Application
  constructor(app) {
    this.app = app;
  };

  public init() {
    this.registerController();
  }

  private registerController() {
    const proxyUrl = '/__api-proxy';
    const handle = async (request: Request, response: Response, next) => {
      const {body} = request;
      console.log(body)
      try {
        const res = await axios(body);
        console.log('res', res.data)
        response.send(res.data);
        next()
      } catch(e) {
        console.log('err', e)
        if (e.response) {
          response.status(e.response.status);
          response.send(e.response.data);
        } else {
          response.status(404);
          response.send();
        }
      }
    }
    this.app.post(proxyUrl, handle);
  }
} 