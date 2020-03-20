接口拦截工具
---

## Usage

安装：
```bash
npm i -g @smock/interceptor
#或

yarn add global @smock/interceptor
```

在启动命令的目录创建`api-proxy.json`文件, 加入如下形式的配置：
(参数分别为代理目标，缓存目录和工作端口)
```json
{
  "target": "http://xxxxxxxx.com",
  "workDir": ".api-proxy",
  "workPort": 10011
}
```

启动代理服务：
```bash
sproxy # 不指定端口（默认运行在4000端口）
sproxy -p 10011 # 指定运行端口, 会覆盖apo-proxy.json里的定义
```

开发环境下，将api接口host设置成 `http://localhost:10011`即可。