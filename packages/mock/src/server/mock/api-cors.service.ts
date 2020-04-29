import { Application, Request, Response, RequestHandler } from "express"
import axios from "axios"

export class ApiCorsService {
  private app: Application
  private path: string

  constructor(app?: Application, path?: string) {
    this.app = app
    this.path = path
  }

  public init(): void {
    this.app.post(this.path, this.createMiddleware().bind(this))
  }

  public createMiddleware(): RequestHandler {
    return async (request: Request, response: Response, next): Promise<void> => {
      const { body } = request
      try {
        const res = await axios(body)
        response.status(res.status)
        for (const key in res.headers || {}) {
          response.header(key, res.headers[key])
        }
        response.send(res.data)
      } catch (e) {
        if (e.response) {
          response.status(e.response.status)
          response.send(e.response.data)
        } else {
          response.status(404)
          response.send()
        }
      }
    }
  }
}
