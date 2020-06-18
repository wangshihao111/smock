## Usage

### Installation:

```bash
npm i @smock/vue-cli-plugin-smock
```

### 使用方式

该服务会在运行`npm run serve` 或 `yarn serve`时自动运行。
运行地址与`vue`开发服务地址一致。
例如：开发服务运行在`http://localhost:8080`,则`mock`接口也运行在此端口。
打开此地址的`/__doc__`路径即可查看文档，例如:`http://localhost:8080/__doc__`。

如何禁用？

启动serve时指定环境变量`NO_SMOCK=true`即可。
例如：
```json
{
  // ...
  "scripts": {
    "serve": "cross-env NO_SMOCK=true vue-cli-service serve"
  }
  // ...
}

```

### 也可以作为vue-cli-service子命令启动

```json
{
  // ...
  "scripts": {
    "smock": "vue-cli-service smock --port 6000"
  }
  // ...
}

```

Then you can run command to start the interceptor service.

```
npm run smock
```

Configuration Documents:

[See here:(https://www.npmjs.com/package/@smock/interceptor)](https://www.npmjs.com/package/@smock/interceptor)