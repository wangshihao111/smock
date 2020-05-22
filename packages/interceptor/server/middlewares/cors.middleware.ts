import { Request, Response } from "express";

export function applyCors(req: Request, res: Response, next: Function): void {
  const { headers } = req;
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Origin",
    headers.origin || `http://${headers.host}`
  );

  const headerKeys =
    Object.keys(headers || {}).join(",") +
    ",cache-control, Content-Length, Authorization, Accept, X-Requested-With, origin, pragma, h-menu-id, content-type";
  res.header("Access-Control-Allow-Headers", headerKeys);
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  if (req.method === "OPTIONS") {
    /* 让options请求快速返回 */
    res.status(200);
    res.send();
  } else {
    next();
  }
}

export function toCors(req: Request, res: Response) {
  const { headers } = req;
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, cache-control, Content-Length, Authorization, Accept, X-Requested-With, origin, pragma"
  );
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  if (req.method === "OPTIONS") {
    res.status(200);
    res.send();
  }
}
