import { apiPrefix } from "./constant";
import fs from "fs";
import path from "path";

export function getRequestPath(_path: string): string {
  return _path.replace(apiPrefix, "");
}

export function initConfigFile() {
  const cwd = process.cwd();
  const file = path.resolve(cwd, ".smockrc.js");
  const defaultFile = path.resolve(__dirname, "../../bin/default-config.js");
  if (!fs.existsSync(file)) {
    const content = fs.readFileSync(defaultFile, "utf8");
    fs.writeFileSync(file, content, "utf8");
    console.log("默认配置文件创建成功。");
  }
}
