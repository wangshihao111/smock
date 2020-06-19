接口拦截工具, 提供可视化接口拦截管理。
---

## 工具简介

- 在项目开发的时候，直接使用后端接口来模拟所有可能出现的情况是很难的。而且在网络出现问题的时候将不能正常的进行开发。
- 为了解决这个问题，我们可以在开发的时候将所有真实接口进行代理，并且缓存到本地。
- 在未开启拦截的时候，工具将从服务器去请求数据。并且把响应体缓存到本地以作不时之需。
- 如果开启拦截，那么会从我们缓存过的历史记录中去查找结果，返回给前端。我们也可以编辑接口返回内容和状态码，来模拟服务器所有可能的返回情况，来达到调试的目的。
- 另外，如果服务器出现了故障或者是网络出了问题，我们也可以直接开启所有接口的拦截。使用本地的缓存内容来进行调试。
- 还有 一个小用途（跨域）。如果接口有跨域问题，可以将此工具当做代理服务器，用来跨域。

## Usage

安装：
```bash
npm i -g @smock/interceptor

#或
yarn add global @smock/interceptor
```

## 新加特性

- 更改配置自动刷新服务，不必每次更改文件后重启服务。

## 命令可用选项：

- `-p` , `--port`, 指定端口。示例： `sproxy -port 8000`
- `-i`, `--init`，生成一个默认配置文件。
- `-V`, `--version` 查看版本
- `-h` 显示帮助信息。

## 配置文件示例：
在启动命令的目录创建`.smockrc.js`文件, 加入如下形式的配置：
> 可以运行`sproxy --init`创建一个默认配置文件。
该文件也会在首次运行时自动创建。

(下面包含所有可配置项)
```js
module.exports = {
  /* 代理目标设置（真实的接口地址）*/
  target: "http://xxxxx.com",

  /* 资源缓存路径 */
  workDir: ".smock",

  /* 拦截服务运行的端口 */
  workPort: 10011,

  /* 正则匹配到的路径将会被缓存 */
  matchRegexp: /.*/,

  /* 是否缓存静态文件 */
  cacheStatic: true,

  /* 加入pathIgnore的路径，仍然会被缓存，但缓存的时候将不会以query或body作为区分
   * 这样做的原因是有些缓存的时候是根据method参数、query参数和body参数为基础计算出来的哈希值
   * 如果请求数据中含有随机数，那么每次请求都会记录一个新值，造成开启拦截后找不到数据的情况
   * 此时可以将这些路径加入忽略路径中。
  */
  pathIgnore: {
    query: [
      '/oauth/logout'
    ],
    body: [
      '/oauth/login'
    ]
  },
  plugins: []
}
```

### 默认配置
```js
module.exports = {
  target: "http://localhost:4000",
  workDir: ".smock",
  workPort: 10011,
  matchRegexp: /.*/,
  cacheStatic: true,
  pathIgnore: {
    query: [],
    body: []
  },
  plugins: []
};
```

启动代理服务：
```bash
sproxy # 不指定端口（以默认配置运行在10011端口）
sproxy -p 10011 # 指定运行端口, 会覆盖.smockrc.js里的定义
```

开发环境下，将api host设置成 `http://localhost:10011`即可。
GUI操作界面：打开`http://localhost:10011/__interceptor`即可查看可视化操作页面。

## 在umi中使用（仅支持umi3.X）

安装umi-插件：

```bash
yarn add @smock/umi-plugin-sproxy -D
```
再次启动命令即可。

> 注意：工具默认运行端口为10011.首次执行会自动生成配置文件，可以更改其中的配置。更改完成后需再次重新启动开发服务。

## 说明：
- 对于matchRegexp匹配到的路径，在请求的时候将会把记录缓存到本地，每次请求成功都会将新的记录缓存进去，替换旧的记录。
- 在可视化页面开启拦截的路径将不会发起真正的请求，而是会直接从本地缓存记录中拿对应请求体的数据。
- 在接口编辑页面可以对拦截历史进行编辑和保存（包括响应体、响应头和响应状态码的编辑），保存操作会更改本地的缓存记录。但关闭拦截后，仍然会使用服务器返回的结果替换现有记录。
- 缓存文件的的存储文件名是根据请求路径得到，是将路径进行encode后得到。每个请求路径对应一个json文件。对于同一个路径的请求，会根据请求method、query和body计算得到一个哈希，使用这个哈希作为键名存放一条请求记录。
- 对于请求query或body中含有随机数或经常变化的值，例如token和时间戳。此时每一次请求的哈希都是全新的值，每个缓存记录都会是新的记录。如果开启了拦截，将不会如期取到缓存结果。为了解决这个问题，在配置文件里添加了忽略路径的选项，可以根据需要配置忽略query的路径和忽略body的路径(例如：/login, /logout等)；这个忽略只是在计算哈希时忽略，缓存记录中仍然会存在这些信息。

## 插件系统

工具支持插件系统，使用插件可以为工具添加一些额外的中间件，和生命周期处理。这些中间件会在被插入拦截中间件之前，基础中间件（bodyParser等）之后。生命周期支持：`created, beforeRequest, afterSend`。

### 插件写法示例：
```javascript
module.exports = (api) => {
  api.registerMiddleware((ctx) => {
    return function (req, res, next) {
      console.log('请求：', req.url);
      next();
    }
  });
  api.transformResponse((data) => {
    return {
      ...data,
      prop1: 'a example value'
    }
  });
  api.on('created', (ctx, scope) => {
    console.log('Created called. logged in log-middleware');
  });
  api.on('beforeRequest', (ctx, scope) => {
    console.log('BeforeRequest called. logged in log-middleware');
  });
  api.on('afterSend', (ctx, scope) => {
    console.log('AfterSend called. logged in log-middleware');
  });
}
```
然后在.smockrc.js中添加如下代码：
```javascript
module.exports {
  // ...
  plugins: [require('path/to/log-middleware')]
}
```

### 可用接口(api对象上的方法)：

- `on(hook: string): void;` 注册一个生命周期处理函数。` hook = 'created' | 'beforeRequest' | 'afterSend'`

- `registerMiddleware(creator: (ctx: GlobalContext) => RequestHandler)` 注册一个中间件

- `transformResponse(transformer: (data: any) => any)` 返回数据处理器

### context的接口定义如下：

```typescript
interface GlobalContextInterface {
  app: Application;
  db: DbUtil;
  file: FileUtil;
  config: ProxyConfig;
  cwd: string;
  pluginApi: PluginApi;
}

export interface ScopedContextInterface {
  request: Request;
  response: Response;
}

```

注意： 余下方法为app内部调用准备。在中间件内调用可能会引起一些意想不到的结果。请勿随意使用。