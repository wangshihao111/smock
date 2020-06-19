## Usage

### Installation:

```bash
npm i @smock/vue-cli-plugin-sproxy
```

### 使用方式

> 该服务会在任何vue子命令启动时启动。

例如：
该服务会在运行`npm run serve` 或 `yarn serve`时自动运行。
该服务会运行在配置文件制定的端口。
详细信息可以查看控制台输出。

如何禁用？

启动serve时指定环境变量`NO_INTERCEPTOR=true`即可。

### 也可以作为vue-cli-service子命令启动

> 注意：使用命令启动时请指定NO_INTERCEPTOR环境变量为true。目的是禁止自动启动的服务。

```json
{
  // ...
  "scripts": {
    "sproxy": "vue-cli-service sproxy --port 5000"
  }
  // ...
}

```

Then you can run command to start the interceptor service.

```
npm run sproxy
```

Configuration Documents:

[See here:(https://www.npmjs.com/package/@smock/interceptor)](https://www.npmjs.com/package/@smock/interceptor)