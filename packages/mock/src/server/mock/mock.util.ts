import { readFileSync, statSync } from "fs-extra"
import { resolve } from "path"
import { parse } from "json5"
import { isArray, isObject, isString, isNumber, uniq } from "lodash"
import { Random } from "mockjs"
import { MockFileContent } from "../domain/JsonFile"
import { ParamType } from "../enums/ParamType"
import { JsDefinition } from "../domain/JsDefinition"
import { config } from "../config/variables"
import { getVariableType } from "../../utils/utils"
import globby from "globby"
import BabelRegister from "@smock/utils/lib/BabelRegister"
import { mockFilePrefix, mockDir } from "./_constant"
import { MockConfigType } from "../domain/config"

const globbyOptions: globby.GlobbyOptions = {
  ignore: ["**/node_modules/**"],
}

function getGlobOptions(config: MockConfigType): globby.GlobbyOptions {
  const { mockExcludes: excludes = [], mockCwd } = config
  const smockIgnore = []
  try {
    const is = JSON.parse(process.env.SMOCK_IGNORE)
    smockIgnore.push(...is)
  } catch (error) {
    process.env.SMOCK_IGNORE && smockIgnore.push(process.env.SMOCK_IGNORE)
  }
  return {
    cwd: mockCwd || process.cwd(),
    ignore: [...globbyOptions.ignore, ...(excludes || []), ...smockIgnore],
  }
}

function getFileFromExt(ext: string, config: MockConfigType): string[] {
  const { mockDirs = [] } = config

  const globStr = mockDirs.length
    ? mockDirs
    : [`**/${mockDir}/**/*.${ext}`, `**/**/${mockFilePrefix}.${ext}`]
  return [
    ...globby
      .sync(globStr, getGlobOptions(config) as any)
      .filter(
        (v) =>
          v.indexOf(mockFilePrefix) > -1 &&
          (v.endsWith(".js") || v.endsWith(".ts") || v.endsWith("json") || v.endsWith("json5"))
      ),
  ]
}

function readConfigFile(base: string): MockConfigType | boolean {
  try {
    return require(resolve(base, ".smockrc.js"))
  } catch (e) {
    return false
  }
}

function getAllFiles(config: MockConfigType): string[] {
  return [
    ...getFileFromExt("json5", config),
    ...getFileFromExt("json", config),
    ...getFileFromExt("js", config),
  ]
}

export class MockUtil {
  private static jsonDefMap = new Map<string, MockFileContent>()

  private static jsDefMap = new Map<string, JsDefinition>()

  public static config: MockConfigType

  public static init() {
    const dirPath = process.cwd()
    if (!this.config) {
      let config = readConfigFile(dirPath)

      if (!config) {
        config = readConfigFile(resolve(dirPath, "../"))
      }
      if (!config) {
        config = readConfigFile(resolve(dirPath, "../../"))
      }
      if (!config) {
        config = {
          mockCwd: dirPath,
        } as MockConfigType
      }
      this.config = config as MockConfigType
    }
  }

  /**
   * 读取本地文件
   * @param path
   */
  public static readLocalFile(): [Map<string, MockFileContent>, Map<string, JsDefinition>] {
    this.init()
    const dirPath = this.config.mockCwd || process.cwd()
    const tsFiles = getFileFromExt("ts", this.config)

    let files: string[] = [...tsFiles]

    const register = new BabelRegister()
    register.setOnlyMap({
      key: "smock",
      value: tsFiles,
    })
    register.register()
    files = uniq(files.concat(getAllFiles(this.config))) // 去除重复值

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
        try {
          const obj = parse(content) as MockFileContent
          this.jsonDefMap.set(obj.name, obj)
        } catch (error) {}
      } else if (isDirectory) {
        // this.readLocalFile()
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

  /**
   * 支持定义方式：
   *  3
   *  3-5
   *  < 3
   * @param str
   */
  public static getDelayTime(str: string): number {
    if (Number(str)) {
      return Number(str)
    }
    const middle = str.split("-")
    if (middle.length === 2) {
      const [first, second] = middle
      return Number(
        (
          Math.min(Number(first), Number(second)) +
          Math.random() * Math.abs(Number(first) - Number(second))
        ).toFixed(2)
      )
    }
    if (str.match(/\s*<\s*(\d+)/)) {
      return Number((Math.random() * Number(RegExp.$1)).toFixed(2))
    }
    return 0
  }
}
