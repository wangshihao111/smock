A mock tool with UI. Powered by Postwoman an Mock.js.
---

## Usage

安装：
```bash
npm i -g @smock/mock
#或

yarn add global @smock/mock
```

启动mock服务：
```bash
smock # 不指定端口（默认运行在4000端口）
smock -p 3333 # 指定运行端口
```


### Features ✨


⚡️ **Simply**: 使用简单，自动生成文档。

🔥**Mock Type:**
 支持所有Mockjs里所有的mock类型

🌈 **Inside Postwoman**: 内置Postwoman，方便调试接口

🔥 **JSON5**: 使用json5定义接口

🔥 **支持js定义接口**: 支持js定义接口，灵活方便

🔥 **命令行工具**: 使用命令一键启动(`$ smock -p 3333`)

## 使用示例：

- json5定义
```json5
{
    name:"Auth",
    desc:"user login and logout",
    order:1,
    apis:
    [{
        name:"login",
        desc:"if user login success, will get a token",
        method: "POST",
        url:"/login",
        body:{
            username:{desc: "username", type: "string", $$mock: "name", required: true},
            password:{desc: "password", type: 'string'}
        },
        response:{
            code:{desc:"response result code", type:"int"},
            msg:{desc:"response result message", type:"string"},
            token:{desc:"login success, get a user token; login failed, no token", type:"string"}
        },
        mock_data:[
            {
                body:{username:"edison", password:"123"},
                response:{code:-1, msg:"password incorrect"}
            },
            {
                body:{username:"lily", password:"123"},
                response:{code:-2, msg:"username not exist"}
            },
            {
                body:{username:"root", password:"123"},
                // {$mock:true}, token field will get mock string, the token mock rule is from response/token
                response:{code:1, msg:"login success", token: 'xyazxdasdfad'} 
            },
            {
                body:{username:"lily"},
                response:{code:-1, msg:"password is required"}
            },
            {
                body:{password:"123"},
                response:{code:-1, msg:"username is required"}
            }
        ]
    },
    {
        name:"user logout",
        method:"GET",
        url:"/logout/",
        query:{
            id:{desc:"user id", type: "string"},
            username:{desc:"user id", type: "string"}
        },
        response:{
            code:{desc:"response result code", type:"int", desc:"success is 1"},
            msg:{desc:"response result message", type:"string", desc:""},
            data: {
                data: {desc: 'dataname', type: 'string'},
                dataType: {desc: 'datatype', type: 'string'},
                obj: {
                        objId: {desc: 'objId', type: 'number'}
                    }
                }
        },
        mock_data:[
            {
                query:{id:1, username:"root"},
                response:{code:1, msg:"logout success"}
            },
            {
                response:{code:-1, msg:"error"}
            },
            {
                query:{id:3, username:"lily"},
                response:{code:-1, msg:"username and id not match"}
            }
        ]
    }
]}

```

### $$mock
$$mock可以指定要某个字段的mock类型，$$mock的值为Mock.js里所有可用Mock类型


## 

<div align="center">
  <br>
  <a href="https://postwoman.io"><img src="https://raw.githubusercontent.com/liyasthomas/templates/master/assets/logo.gif" alt="Postwoman.io" width="200"></a>
  <br>
  <h3>Happy Coding ❤︎</h3>
</div>
