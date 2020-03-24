接口拦截工具
---

## Usage

安装：
```bash
npm i -g @smock/interceptor
#或

yarn add global @smock/interceptor
```

在启动命令的目录创建`.smockrc.js`文件, 加入如下形式的配置：
(参数分别为代理目标，缓存目录和工作端口)
```js
module.exports = {
  // 代理设置
  target: "http://xxxxx.com",
  /* 资源缓存路径 */
  workDir: ".smock",

  /* 拦截服务运行的端口 */
  workPort: 10011,

  /* 正则匹配，匹配到的路径将会被缓存 */
  matchRegexp: /.*/,

  /* 是否缓存静态文件 */
  cacheStatic: true,

  /* 加入pathIgnore的路径，缓存的时候将不会以query或body作区分
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
  }
}
```

启动代理服务：
```bash
sproxy # 不指定端口（默认运行在4000端口）
sproxy -p 10011 # 指定运行端口, 会覆盖apo-proxy.json里的定义
```

开发环境下，将api接口host设置成 `http://localhost:10011`即可。