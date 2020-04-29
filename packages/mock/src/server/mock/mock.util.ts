import { readFileSync, statSync } from "fs-extra"
import { resolve } from "path"
import { parse } from "json5"
import { isArray, isObject, isString, isNumber } from "lodash"
import { Random } from "mockjs"
import { MockFileContent } from "../domain/JsonFile"
import { ParamType } from "../enums/ParamType"
import { JsDefinition } from "../domain/JsDefinition"
import { config } from "../config/variables"
import { getVariableType } from "../../utils/utils"
import glob, { IOptions } from "glob"
import BabelRegister from "@smock/utils/lib/BabelRegister"
import { mockFilePrefix, mockDir } from "./_constant"

const globOptions: IOptions = {
  ignore: ["**/node_modules/**"],
  root: process.cwd(),
}
function getFileFromExt(ext: string): string[] {
  return [...glob.sync(`**/${mockDir}/**/*.${ext}`, { ...globOptions })]
}

function getAllFiles(): string[] {
  return [...getFileFromExt("json5"), ...getFileFromExt("json"), ...getFileFromExt("js")]
}

export class MockUtil {
  private static jsonDefMap = new Map<string, MockFileContent>()

  private static jsDefMap = new Map<string, JsDefinition>()

  /**
   * 读取本地文件
   * @param path
   */
  public static readLocalFile(
    path: string
  ): [Map<string, MockFileContent>, Map<string, JsDefinition>] {
    const dirPath = process.cwd()
    const tsFiles = [
      ...getFileFromExt("ts"),
      ...glob.sync(`**/**/${mockFilePrefix}.ts`, globOptions),
    ]
    let files: string[] = [
      ...glob.sync("live-mock/**/*.json5", globOptions),
      ...glob.sync("live-mock/**/*.json", globOptions),
      ...glob.sync("live-mock/**/*.js", globOptions),
      ...glob.sync(`**/**/${mockFilePrefix}.js`, globOptions),
      ...tsFiles,
    ]
    const register = new BabelRegister()
    register.setOnlyMap({
      key: "smock",
      value: tsFiles,
    })
    register.register()
    files = files.concat(getAllFiles())
    files.forEach((file) => {
      const isJs = /^.+\.js$/.test(file)
      const isJson = /^.+(\.json|\.json5)$/.test(file)
      const isTsFile = /^.+\.tsx?$/.test(file)
      const filePath = resolve(dirPath, file)
      const stat = statSync(filePath)
      const isDirectory = stat.isDirectory()
      if ((isJs || isTsFile) && !isDirectory) {
        try {
          delete require.cache[require.resolve(filePath)]
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const jsDef = require(filePath)
          if (jsDef) {
            this.jsDefMap.set(jsDef.name, jsDef)
          }
        } catch (e) {
          console.log(e)
        }
      } else if (!isDirectory && isJson) {
        const content = readFileSync(resolve(dirPath, file), "utf8")
        const obj = parse(content) as MockFileContent
        this.jsonDefMap.set(obj.name, obj)
      } else if (isDirectory) {
        this.readLocalFile(filePath)
      }
    })
    return [this.jsonDefMap, this.jsDefMap]
  }

  public static getMockedData(typeDef, data): any {
    let result = {} as any
    if (typeDef.type) {
      if (!typeDef.required) return data
      if (typeDef.required && typeDef.$$mock) {
        return this.getOneMock(typeDef)
      }
    }
    if (isArray(typeDef)) {
      if (isArray(data)) return data
      result = []
      let length = config.defaultArrayMockLength
      const defLength = typeDef[0].length
      const isDefLength = isNumber(defLength)
      if (isDefLength) {
        length = defLength
      }
      Array.from({ length }).forEach(() => {
        let thisDef = typeDef[0]
        if (isDefLength) {
          const { length: _, ...rest } = typeDef[0]
          thisDef = rest
        }
        result.push(this.getMockedData(thisDef, undefined))
      })
      return result
    }

    for (const key in typeDef) {
      const defValue = typeDef[key]
      const value = data ? data[key] : undefined
      result[key] = this.getMockedData(defValue, value)
    }
    return result
  }

  private static getOneMock(conf): any {
    let mockedValue
    const randomFun = Random[conf.$$mock]
    if (randomFun) {
      const params = conf.params || []
      mockedValue = Random[conf.$$mock](...params)
    } else {
      mockedValue = "没有找到mock类型，请检查您的$$mock配置"
    }
    return mockedValue
  }

  /**
   * 校验字段类型
   * @param apiType Object query 或 body 配置对象
   * @param obj // 需要判断类型的对象
   * @param isQuery // 是否是query参数，因为query参数要做特殊处理（关于数字和字符串）
   */
  public static validateParams(apiType, obj, isQuery = false): boolean {
    if (apiType.type) {
      // 只有个单值
      const { type, required } = apiType
      let typeValid = type === getVariableType(obj)
      if (isQuery && type === ParamType.NUMBER) {
        const pType = getVariableType(Number(obj))
        typeValid = pType === ParamType.NUMBER
      }
      const requiredValid = (required && obj !== undefined && typeValid) || (!required && typeValid)
      return typeValid && requiredValid
    }
    if (isArray(apiType)) {
      // 是定义是数组的情况
      if (isArray(obj)) {
        return obj.every((o) => MockUtil.validateParams(apiType[0], o, isQuery))
      }
      return false
    }
    if (isObject(apiType) && isObject(obj)) {
      const keys = Object.keys(apiType)
      return keys.every((key) => this.validateParams(apiType[key], obj[key], isQuery))
    }
    return apiType === obj
  }

  /**
   * 将query字段的值统一转成字符串类型
   * 在json5文件中定义的query中，有些字段是数字或者布尔值，但是express收到的query里边都会被转成字符串
   * 所有要进行一个转换
   * @param query
   */
  public static changeQueryToString(query = {}): any {
    const result = {}
    for (const key in query) {
      if (isString(query[key]) || isNumber(query[key])) {
        result[key] = String(query[key])
      } else if (isArray(query[key])) {
        result[key] = query[key].map((v) =>
          isString(v) || isNumber(v) ? v : MockUtil.changeQueryToString(v)
        )
      } else {
        result[key] = MockUtil.changeQueryToString(query[key])
      }
    }
    return result
  }
}
