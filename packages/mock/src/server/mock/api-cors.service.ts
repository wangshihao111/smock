import { Application, Request, Response } from 'express';
import axios from 'axios';

export class ApiCorsService {
  private app: Application

  constructor (app) {
    this.app = app;
  }

  public init () {
    this.registerController();
  }

  private registerController () {
    const proxyUrl = '/__api-proxy';
    const handle = async (request: Request, response: Response, next) => {
      const { body } = request;
      try {
        const res = await axios(body);
        response.send(res.data);
        next();
      } catch (e) {
        if (e.response) {
          response.status(e.response.status);
          response.send(e.response.data);
        } else {
          response.status(404);
          response.send();
        }
      }
    };
    this.app.post(proxyUrl, handle);
  }
}
