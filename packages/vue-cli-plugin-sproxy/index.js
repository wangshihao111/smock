const execa = require('execa');
const kill = require('tree-kill');
const path  = require('path');
var startIntercept = require('@smock/interceptor/lib/main').default;

const scriptPath = path.resolve(__dirname, 'sproxy.js');

module.exports = (api, projectOptions) => {

  api.configureWebpack(webpackConfig => {
    // 修改 webpack 配置
    // 或返回通过 webpack-merge 合并的配置对象
  })

  if (!process.env.NO_INTERCEPTOR || NO_INTERCEPTOR === 'false') {
    startIntercept();
  }

  api.registerCommand('sproxy', {
    options: {
      '-p --port <port>': '指定运行端口'
    }
  }, args => {

    startIntercept(args.port);
    // const cmd = `node ${scriptPath} -p ${args.port}`;
    // const child = execa(cmd, [], {
    //   shell: true,
    //   cwd: process.cwd()
    // })
  //   child.stdout.on('data', buf => console.log(buf.toString()));
  //   child.stderr.on('data', buf => console.log(buf.toString()));
  //   // child.on('error', (e) => {console.log(e)})
  //   child.catch(() => {})
  //   process.on('SIGINT', () => {
  //     kill(child.pid, () => {
  //       process.exit();
  //     })
  //   })
  //   process.on('SIGTERM', () => {
  //     kill(child.pid, () => {
  //       process.exit();
  //     })
  //   })
  //   process.on('SIGHUP', () => {
  //     kill(child.pid, () => {
  //       process.exit();
  //     })
  //   })
  })
}