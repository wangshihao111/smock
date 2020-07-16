#!/usr/bin/env node

var program = require('commander');
var startIntercept = require('../lib/main').default;
const fs = require('fs');
const path = require('path');

program
  .version(require('../package.json').version)
  .usage('[options]')

program
  .option('-p --port <port>', 'mock服务运行的端口')
  .option('-i --init', "创建一个默认的配置文件。")

program.parse(process.argv);

if (program.init) {
  const cwd = process.cwd();
  try {
    fs.readFileSync(path.resolve(cwd, '.smockrc.js'));
    console.log('配置文件已存在，跳过创建。')
  } catch (error) {
    fs.createReadStream(path.resolve(__dirname, 'default-config.js'))
      .pipe(fs.createWriteStream(path.resolve(cwd, '.smockrc.js')));
    console.log('已创建配置文件。')
  }
} else {

  let port = program.port;
  if (port) {
    port = Number(port);
  }

  startIntercept(port);
}
