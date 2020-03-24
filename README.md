# smock

## smock是什么？

smock是一个mock + 拦截工具集合，提供接口mock和接口拦截功能。

## mock工具

### 安装
```bash
npm i -g @smock/mock
```

### 使用：
在某个文件夹内新建live-mock文件夹，在该文件夹内运行以下命令：
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