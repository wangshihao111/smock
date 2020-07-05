import { Request, Response } from "express"

export interface HandleRet {
  status: number
  delay?: string | number
  data: any
}

export interface JsApiItem {
  name: string
  desc?: string
  url: string
  method: "POST" | "GET" | "DELETE" | "PUT" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE"
  handle: (req: Request, res: Response) => void | HandleRet
}

export interface JsDefinition {
  name: string
  desc: string
  apis: JsApiItem[]
}
