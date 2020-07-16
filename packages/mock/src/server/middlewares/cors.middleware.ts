export function applyCors(req, res, next): void {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] || "")
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  res.header("X-Powered-By", " 3.2.1")
  if (req.method === "OPTIONS") {
    /* 让options请求快速返回 */
    res.header("Access-Control-Max-Age", "18000") // 减少OPTIONS请求
    res.status(200)
    res.send()
  } else next()
}
