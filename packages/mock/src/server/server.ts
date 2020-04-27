import bodyParser from "body-parser"
import express, { Application, Request, Response } from "express"
import { resolve } from "path"
import { MockService } from "./mock/mock.service"
import { ApiCorsService } from "./mock/api-cors.service"
import { applyCors } from "./middlewares/cors.middleware"
import chalk from "chalk"
import glob from "glob"
import { watch } from "fs-extra"
import { debounce } from "lodash"

function watchMockFiles(callback: (event: string, filename: string) => void): void {
  const liveMocks = glob.sync("**/live-mock", {
    ignore: ["**/node_modules/**"],
    root: process.cwd(),
  })
  const dirs = glob
    .sync("**/smock", { ignore: ["**/node_modules/**"], root: process.cwd() })
    .concat(liveMocks)
  const watcher = debounce((event: string, filename: string) => {
    callback(event, filename)
  }, 500)
  dirs.forEach((dir: string) => {
    watch(dir, watcher)
  })
}

export function runMock(app: Application, port: number, host: string): void {
  app.use("/__doc", express.static(resolve(__dirname, "../../dist")))
  const mockInstance = new MockService(app, port, host)
  const apiCorsService = new ApiCorsService(app)
  mockInstance.init()
  apiCorsService.init()
  watchMockFiles(() => {
    console.log("mock文件变动，重新加载文件...")
    mockInstance.reset()
  })
}

export default function createMock({ host = "0.0.0.0", port = 4000 }): void {
  const app: Application = express()
  app.all("*", applyCors)
  app.use(bodyParser.text())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  runMock(app, port, host)
  app.listen(port, host, () => {
    console.log(`${chalk.blue("Mock 服务运行在: ")}${chalk.green(`http://127.0.0.1:${port}`)}`)
    console.log(
      `${chalk.greenBright("您可以打开此地址以查看接口文档:")}${chalk.green(
        `http://127.0.0.1:${port}/__doc`
      )}`
    )
  })
}

export function createExpressMiddleware(port) {
  const instance = new MockService({} as any, port, "127.0.0.1")
  watchMockFiles(() => {
    console.log("文件变动，重新加载mock文件")
    instance.reset()
  })
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const serveStatic = require("../utils/serve-static")
  const staticMiddleware = serveStatic(resolve(__dirname, "../../dist"))
  const mockMiddleware = instance.createMiddleware()
  return (request: Request, response: Response, next) => {
    if (request.path.startsWith("/__doc__")) {
      staticMiddleware(request, response, next)
    } else {
      mockMiddleware(request, response, next)
    }
  }
}
