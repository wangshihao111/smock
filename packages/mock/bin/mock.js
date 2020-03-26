#!/usr/bin/env node
/* eslint-disable */
const fs = require("fs")
var program = require('commander');
const path = require("path")
const execa = require("execa")
const _ = require('lodash')
const chalk = require('chalk');
const kill = require('tree-kill');

function initFolder(cwd) {
  const targetDirPath = path.resolve(cwd, 'live-mock')
  fs.mkdirSync(targetDirPath);
  console.log(`${chalk.blue('文件夹创建成功，文件夹位置：')}${chalk.green(targetDirPath)}`);
  console.log(chalk.yellow('创建demo文件中...'));
  fs.createReadStream(path.resolve(__dirname, 'demo.json5')).pipe(fs.createWriteStream(path.resolve(cwd, 'live-mock/demo.json5')));
  fs.createReadStream(path.resolve(__dirname, 'demo.js')).pipe(fs.createWriteStream(path.resolve(cwd, 'live-mock/demo.js')));
}

function boot() {
  const cwd = process.cwd();
  program
  .version(require('../package.json').version)
  .usage('<command> [options]')
  
  program
    .option('-p --port <port>', 'mock服务运行的端口')
  
  program.parse(process.argv);
  
  let port = program.port || 4000;
  if (port) {
    port = Number(port);
  }
  const watchPath = path.resolve(cwd, "live-mock")
  const args = ["--port", port]
  const scriptPath = path.resolve(__dirname, "./start.js")
  let child
  
  function startMock() {
    console.log(chalk.blue('启动Mock服务...'))
    child = execa(`node ${scriptPath}`, args, {
      shell: true,
      cwd
    })
    child.stdout.on("data", buf => console.log(chalk.blue(buf.toString())))
    child.stderr.on("data", buf => console.log(chalk.blue(buf.toString())))
    child.catch(e => {console.log()});
  }
  
  const restart = _.debounce(() => {
    console.log(chalk.blue('准备重启中...'))
    kill(child.pid,  () => {
      startMock()
    })
  }, 500)
  
  try {
    fs.watch(watchPath, restart);
    console.log(`${chalk.blue('正在监听文件夹变动：')}${chalk.green(watchPath)}`)
  } catch (error) {
    console.log(`${chalk.blue('文件夹')} ${chalk.yellow('live-mock')} ${chalk.blue('不存在，准备创建文件夹...')}`)
    initFolder(cwd);
  }
  
  process.on("SIGINT", () => {
    kill(child.pid, () => {
      console.log(chalk.yellow('已退出Mock服务。'))
      process.exit();
    })
  })
  
  process.on('SIGHUP', () => {
    kill(child.pid, () => {
      process.exit();
    })
  });
  
  process.on('SIGTERM', () => {
    kill(child.pid, () => {
      process.exit();
    })
  });
  
  startMock()
}

boot();