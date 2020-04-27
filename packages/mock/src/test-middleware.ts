import { createExpressMiddleware } from "./server/server"
import express from "express"

const app = express()

app.use(createExpressMiddleware(3333))

app.listen(3333)
