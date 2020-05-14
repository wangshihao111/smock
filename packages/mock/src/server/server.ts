import bodyParser from "body-parser"
import express, { Application, Request, Response } from "express"
import { resolve } from "path"
import { MockService } from "./mock/mock.service"
import { ApiCorsService } from "./mock/api-cors.service"
import { applyCors } from "./middlewares/cors.middleware"
import chalk from "chalk"
import { serveStatic } from "@smock/utils"

export function runMock(app: Application, port: number, host: string): void {
  app.use("/__doc", serveStatic(resolve(__dirname, "../../dist"), {}))
  const mockInstance = new MockService(app, port, host)
  const apiCorsService = new ApiCorsService(app)
  mockInstance.init()
  apiCorsService.init()
}

export default function createMock({ host = "0.0.0.0", port = 4000 }): void {
  const app: Application = express()
  app.all("*", applyCors)
  app.use(bodyParser.text())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(createExpressMiddleware(port))
  app.listen(port, host)
}

export function createExpressMiddleware(port) {
  const instance = new MockService({} as any, port, "127.0.0.1")
  console.log(chalk.green(`mock服务运行在：http://127.0.0.1:${port}`))
  console.log(chalk.green(`你可以在浏览器打开此地址以查看文档：http://127.0.0.1:${port}/__doc__`))
  const apiCorsMiddleware = new ApiCorsService().createMiddleware()
  const staticMiddleware = serveStatic(resolve(__dirname, "../../dist"), { basePath: "__doc__" })
  const mockMiddleware = instance.createMiddleware()
  return (request: Request, response: Response, next) => {
    const requestPath = request.path || ""
    if (requestPath.startsWith("/__doc__")) {
      staticMiddleware(request, response, next)
    } else if (requestPath.startsWith("/__api-proxy")) {
      apiCorsMiddleware(request, response, next)
    } else if (requestPath.startsWith("/__reset__")) {
      instance.reset()
      response.status(200).send("success")
    } else {
      mockMiddleware(request, response, next)
    }
  }
}
