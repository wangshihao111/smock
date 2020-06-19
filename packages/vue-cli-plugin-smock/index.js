// const execa = require('execa');
// const path = require('path');
// const kill = require('tree-kill');
const { createExpressMiddleware, default: createMock } = require('@smock/mock/lib/server/server');

// const scriptPath = path.resolve(__dirname, "./smock.js")

// let child;

module.exports = (api, projectOptions) => {
  // api.configureWebpack(webpackConfig => {
  //   // 修改 webpack 配置
  //   // 或返回通过 webpack-merge 合并的配置对象
  //   const oldServerConf = webpackConfig.devServer || {};
  //   return process.env.NO_SMOCK ? {
  //     ...webpackConfig,
  //     devServer: {
  //       ...oldServerConf,
  //       before(app) {
  //         if (oldServerConf.before && typeof oldServerConf.before === 'function') {
  //           oldServerConf.before(app);
  //         }
  //         app.use(createExpressMiddleware());
  //       }
  //     }
  //   } : webpackConfig;
  // })

  if(!process.env.NO_SMOCK || process.env.NO_SMOCK === 'false') {
    api.configureDevServer((app) => {
      app.use(createExpressMiddleware());
    });
  }

  api.registerCommand('smock', {
    options: {
      '-p --port <port>': 'specify working port<指定运行端口>'
    }
  }, args => {
    createMock({port: args.port})
    // const cwd = process.cwd();
    // console.log('work dir:', cwd)
    // const cmd = `node ${scriptPath} -p ${args.port || 4000}`;
    // const child = execa(cmd, [], {
    //   shell: true,
    //   cwd: process.cwd()
    // });
    // child.stdout.on('data', buf => console.log(buf.toString()));
    // child.stderr.on('data', buf => console.log(buf.toString()));
    // // child.on('error', (e) => {console.log(e)})
    // child.catch(() => {})
    // process.on('SIGINT', () => {
    //   kill(child.pid, () => {
    //     process.exit();
    //   })
    // })
    // process.on('SIGTERM', () => {
    //   kill(child.pid, () => {
    //     process.exit();
    //   })
    // })
    // process.on('SIGHUP', () => {
    //   kill(child.pid, () => {
    //     process.exit();
    //   })
    // })
  })
}