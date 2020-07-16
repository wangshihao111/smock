# smock

## smock是什么？

smock是一个mock + 拦截工具集合，提供接口mock和接口拦截功能。

## mock工具

### 安装
```bash
npm i -g @smock/mock
```

### 使用：
在某个文件夹内新建_smock_文件夹，在该文件夹内运行以下命令(首次启动会自动创建示例文件)：
```bash
smock -p 3333 # 以命令行工具的形式启动mock服务
```

### 接口定义：

[详情参考：(https://github.com/wangshihao111/smock/tree/master/packages/mock)](https://github.com/wangshihao111/smock/tree/master/packages/mock)


## 拦截工具

### 安装：
```bash
npm i -g @smock/interceptor
```

### 使用：
```bash
sproxy -p 10011
```

### 配置文件定义

[详情参考（https://github.com/wangshihao111/smock/tree/master/packages/interceptor）](https://github.com/wangshihao111/smock/tree/master/packages/interceptor)


## 插件化

- [@smock/vue-cli-plugin-smock](https://www.npmjs.com/package/@smock/vue-cli-plugin-smock)

- [@smock/vue-cli-plugin-sproxy](https://www.npmjs.com/package/@smock/vue-cli-plugin-sproxy)

- [@smock/umi-plugin-smock](https://www.npmjs.com/package/@smock/umi-plugin-smock)

- [@smock/umi-plugin-sproxy](https://www.npmjs.com/package/@smock/umi-plugin-sproxy)

- [@smock/gatsby-plugin-smock](https://www.npmjs.com/package/@smock/gatsby-plugin-smock)
- [@smock/gatsby-plugin-sproxy](https://www.npmjs.com/package/@smock/gatsby-plugin-sproxy)