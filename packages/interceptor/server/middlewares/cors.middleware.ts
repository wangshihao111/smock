import { Request, Response } from "express";

export function applyCors(req: Request, res: Response, next: Function): void {
  const { headers } = req;
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Origin",
    headers.origin || `http://${headers.host}`
  );

  const headerKeys = req.headers["access-control-request-headers"] || "";
  res.header("Access-Control-Allow-Headers", headerKeys);

  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  if (req.method === "OPTIONS") {
    /* 让options请求快速返回 */
    res.header("Access-Control-Max-Age", "18000"); // 减少OPTIONS请求
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
    req.headers["access-control-request-headers"] || ""
  );
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  if (req.method === "OPTIONS") {
    res.status(200);
    res.send();
  }
}
