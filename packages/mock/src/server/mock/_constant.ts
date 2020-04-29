import { IOptions } from "glob"

export const mockDir = "_smock"
export const mockFilePrefix = "_smock"

export const globOptions: IOptions = {
  ignore: ["**/node_modules/**"],
  root: process.cwd(),
}
