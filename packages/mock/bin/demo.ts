import { Request, Response } from "express"

module.exports = {
  name: "ts-demo",
  desc: "ts apis",
  apis: [
    {
      name: "ts-demo one",
      desc: "example 1",
      method: "GET",
      url: "/test-ts-1",
      handle: (req: Request, res: Response) => {
        res.status(200)
        res.send({
          code: 0,
          message: "hello smock TS.",
        })
      },
    },
    {
      name: "ts-demo two",
      desc: "example 2",
      method: "POST",
      url: "/test-ts-2",
      handle: (req: Request, res: Response) => {
        return {
          status: 200,
          data: {
            message: "hello smock ts.",
          },
        }
      },
    },
  ],
}
