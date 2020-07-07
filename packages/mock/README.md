A mock tool with UI. Powered by Postwoman and Mock.js.
---

在使用过程中如果遇到问题，欢迎在github提issue, 非常感谢。

## Break Changes

相比0.1.x版本，mock文件夹变为_smock（为了不与业务代码冲突）

## Usage
(工具会以当前启动命令的文件夹作为根路径。扫描_smock文件夹内所有文件(不区分文件名)，也会扫描所有_smock.js或_smock.ts文件)

安装：
```bash
npm i -g @smock/mock
#或

yarn add global @smock/mock
```

如果启动命令的目录中不存在_smock文件夹，工具会自动创建_smock文件夹，并创建demo文件。
(原来的live-mock文件夹仍然支持，但可能会在后续的版本中去除。)

启动mock服务：
```bash
smock # 不指定端口（默认运行在4000端口）
smock -p 3333 # 指定运行端口
```

此时调用`http://localhost:3333`对应的mock地址即可拿到mock数据。

使用浏览器打开地址`http://localhost:3333/__doc__`，即可查看文档，并测试接口。

修改、新建定义文件，服务将自动重启。

## 在vue-cli中使用

- 安装`@smock/vue-cli-plugin-smock`
- 在`package.json`里的`scripts`中加入一项，例如：
```json
{
  "scripts": {
    "smock": "vue-cli-service smock -p 5000"
  }
}
```

## 在umi中使用

- 安装`@smock/umi-plugin-smock`

再次启动即可自动应用。

### Features ✨

⚡️ **Simply**: 使用简单，自动生成文档。

🔥**Mock Type:**
 支持所有Mockjs里所有的mock类型。

🌈 **Inside Postwoman**: 内置Postwoman，方便调试接口。

🔥 **JSON5**: 使用json5定义接口，简单方便。

🔥 **支持js定义接口**: 支持js定义接口，更加灵活。

🔥 **命令行工具**: 使用命令一键启动(`$ smock -p 3333`)

### 忽略某些文件

如果要忽略某些文件（即这些文件不会被当做mock定义文件），则可以在启动文件夹下新建.smockrc.js，加入配置项:mockExcludes，改配置项为一个数组，包含一些列glob路径，例如：
当我们想在_smock文件夹下保存一些配置文件或工具函数，这些文件不能被当做mock文件来加载，假设我们要忽略_data和_utils文件夹，那我们可以指定如下配置：
```js
// .smockrc.js
module.exports = {
  // ...
  mockExcludes: ['**/_smock/_data/**', '**/_smock/_utils_/**']
}
```

也可以指定环境变量，例如：

```bash
export SMOCK_IGNORE="**/_smock/_data/**"
# 或
export SMOCK_IGNORE="[\"**/_smock/_data/**\", \"**/_smock/_utils_/**\"]" # 注意：使用数组时，必须为可以使用JSON.parse序列化的值
```

### 可用类型（type字段）

- [x] string 字符串类型
- [x] boolean 布尔类型
- [x] number 类型
- [x] 对象类型
- [x] 数组类型

## 使用示例：

### json5定义（同样支持json格式定义）

说明：
- 整个文件包含字段`name`、`desc`和`apis`，`apis`字段为一个数组，包含了一系列接口.
- `apis`的每一项必须指定`method`、`url`和`response`参数.
- 每个参数必须指定`type`字段来指定类型。
- 需`mock`的数据需要定义`$$mock`字段。改字段的值为Mock.js的`Random`中的可用`mock`类型，使用`$$mock`时，必须指定`required: true`。[详细参考(https://github.com/nuysoft/Mock/wiki)](https://github.com/nuysoft/Mock/wiki)
- 可以为`mock`类型传递一些参数，只需加上`params`字段,该字段为一个数组，按顺序填入`Random`函数的参数即可。
- 支持嵌套对象、数组以及原始类型。`query`不能使用原始类型，必须为对象类型或不定义。
- 是数组类型时，可以多指定一个参数————`length`，标识数组的长度, 默认。
- `desc`字段为文档展示所用。可以不定义，不影响接口功能但文档无法显示描述。
- 可以为每个API指定一个`mock_data`选项，该选项中定义的字段会直接返回，未指定的`required`为`true`的且是`$$mock`的将会使用`Random`函数生产。
示例：

```json5
{
  name:"Auth",
  desc:"user login and logout",
  apis:
  [{
    name:"login",
    desc:"if user login success, will get a token",
    method: "POST",
    url:"/login",
    delay: "5",  // 可用定义形式 3 或者 3-5 或者 < 5 诸如此种形式
    body:{
      username: {desc: "username", type: "string", $$mock: "name", required: true},
      password: {desc: "password", type: 'string'},
    },
    response:{
      code: {desc:"response result code", type:"int"},
      msg: {desc:"response result message", type:"string"},
      token: {desc:"login success, get a user token; login failed, no token", type:"string"},

       /* 嵌套对象演示 */
      nestObj: {
        // mock 指定参数（params）：
        keyOne: {type: "string", desc: "example", $$mock: "paragraph", params: [16, 54]},
        keyTwo: {type: "number", desc: "example nest object"},
        innerObj: {
          innerKeyOne: {type: "string", desc: "example"},
          innerKeyTwo: {type: "number", desc: "example nest object"},
        }
      },

      /* 原始类型数组使用演示: */
      arrayPrimitiveValue: [{type: "string", desc: "primitive array value example", length: 16}],

      /* 对象数组类型演示: */
      arrObjectValue: [{
        length: 16,
        keyOne: {type: "string", desc: "example"},
        keyTwo: {type: "number", desc: "example nest object"},
        arrayValue: [{type: "string", desc: "primitive array value example"}],
      }]
    },
    mock_data:[
      {
        body:{username:"edison", password:"123"},
        response:{code:-1, msg:"password incorrect"}
      },
    ]
  }
]}

```

### js定义

当json格式定义无法满足需求时，可以使用`js`定义代替, 例如发送文件，从远程获取数据等。

handle方法中接收的req，和res参数是express Request对象和Response对象，内部已经使用了bodyParser处理。
如需随机产生一些值，可以直接使用Mock.js的Random。[详细用法参考(https://github.com/nuysoft/Mock/wiki)](https://github.com/nuysoft/Mock/wiki)

说明：
- 使用`js`定义时，`query`和`body`的格式不会加入校验，可忽略`query`和`body`的定义。如果写了`query`定义或`body`定义，将只会作为文档展示。
- 可以直接返回一个对象，也可以使用res.send来发送数据，内部是以有无返回值来区分的，没有意义的返回值请不要返回。

```javascript
const { Random } = require('mockjs');
// Random可以随意使用，用法参考Mock.js
module.exports = {
  name: 'hello js',
  desc: 'js apis test',
  apis: [
    {
      name: 'data',
      desc: 'js definition example',
      method: 'POST',
      url: '/test-js',
      // req和res为express Request 对象和 Response对象
      handle: (req, res) => {
        res.status(200);
        res.send({
          code: 1,
          message: 'hello js',
        });
        /*
        也可以返回一个对象，当返回一个对象时(obj)，这个对象data属性将会被使用res.send()方法发送给前端.status属性当作状态码返回给前端。
        返回体示例如下：
        return {
          status: 200, // http状态码
          delay: "3", // 可用定义形式 3 或者 3-5 或者 < 5 诸如此种形式
          data: {
            message: 'hello world.',
          }
        }
        */
      }
    }
  ],
}
```

##

<div align="center">
  <br>
  <a href="https://postwoman.io"><img src="https://raw.githubusercontent.com/liyasthomas/templates/master/assets/logo.gif" alt="Postwoman.io" width="200"></a>
  <br>
  <h3>Happy Coding ❤︎</h3>
</div>
