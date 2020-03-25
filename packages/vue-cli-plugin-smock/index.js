const execa = require('execa');
const path = require('path');
const kill = require('tree-kill');

const scriptPath = path.resolve(__dirname, "./smock.js")

// let child;

module.exports = (api, projectOptions) => {
  api.configureWebpack(webpackConfig => {
    // 修改 webpack 配置
    // 或返回通过 webpack-merge 合并的配置对象
  })

  api.registerCommand('smock', {}, args => {
    const cwd = process.cwd();
    console.log('work dir:', cwd)
    const cmd = `node ${scriptPath} -p ${args.port}`;
    const child = execa(cmd, [], {
      shell: true,
      cwd: process.cwd()
    });
    child.stdout.on('data', buf => console.log(buf.toString()));
    child.stderr.on('data', buf => console.log(buf.toString()));
    // child.on('error', (e) => {console.log(e)})
    child.catch(() => {})
    process.on('SIGINT', () => {
      kill(child.pid, () => {
        process.exit();
      })
    })
    process.on('SIGTERM', () => {
      kill(child.pid, () => {
        process.exit();
      })
    })
    process.on('SIGHUP', () => {
      kill(child.pid, () => {
        process.exit();
      })
    })
  })
}