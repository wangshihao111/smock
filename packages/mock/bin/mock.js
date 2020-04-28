#!/usr/bin/env node
/* eslint-disable */
const fs = require("fs")
var program = require('commander');
const path = require("path")
const _ = require('lodash')
const chalk = require('chalk');
const glob = require('glob');
const createMock = require('../lib/server/server').default;

const globOptions = {
  root: process.cwd(),
  ignore: ["**/node_modules/**"],
}

function initFolder(cwd) {
  const targetDirPath = path.resolve(cwd, 'smock')
  const mockDirs = glob.sync('**/live-mock', globOptions).concat(glob.sync('**/smock', globOptions));
  if (!mockDirs.length) {
    console.log(chalk.yellow('未发现smock或live-mock文件夹，自动创建中...'));
    fs.mkdirSync(targetDirPath);
    console.log(`${chalk.yellow('文件夹创建成功，文件夹位置：')}${chalk.green(targetDirPath)}`);
    console.log(chalk.yellow('创建demo文件中...'));
    fs.writeFileSync(path.resolve(targetDirPath, 'demo.json5'), fs.readFileSync(path.resolve(__dirname, 'demo.json5')), 'utf8')
    fs.writeFileSync(path.resolve(targetDirPath, 'demo.js'), fs.readFileSync(path.resolve(__dirname, 'demo.js')), 'utf8')
    fs.writeFileSync(path.resolve(targetDirPath, 'demo.ts'), fs.readFileSync(path.resolve(__dirname, 'demo.ts')), 'utf8')

    // fs.createReadStream(path.resolve(__dirname, 'demo.json5')).pipe(fs.createWriteStream(path.resolve(targetDirPath, 'demo.json5')));
    // fs.createReadStream(path.resolve(__dirname, 'demo.js')).pipe(fs.createWriteStream(path.resolve(targetDirPath, 'demo.js')));
    // fs.createReadStream(path.resolve(__dirname, 'demo.ts')).pipe(fs.createWriteStream(path.resolve(targetDirPath, 'demo.ts')));
  }
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
  initFolder(cwd);
  createMock({port});
  // const watchPath = path.resolve(cwd, "live-mock")
  // const args = ["--port", port]
  // const scriptPath = path.resolve(__dirname, "./start.js")
  // let child

  // function startMock() {
  //   console.log(chalk.yellow('启动Mock服务...\n'))
  //   child = execa(`node ${scriptPath}`, args, {
  //     shell: true,
  //     cwd
  //   })
  //   child.stdout.on("data", buf => console.log(chalk.yellow(buf.toString())))
  //   child.stderr.on("data", buf => console.log(chalk.yellow(buf.toString())))
  //   child.catch(e => {console.log()});
  // }

  // const restart = _.debounce(() => {
  //   console.log(chalk.yellow('准备重启中...'))
  //   kill(child.pid,  () => {
  //     startMock()
  //   })
  // }, 500)

  // try {
  //   fs.watch(watchPath, restart);
  //   console.log(`${chalk.yellow('正在监听文件夹变动：')}${chalk.green(watchPath)}\n`)
  // } catch (error) {
  //   console.log(`${chalk.yellow('文件夹')} ${chalk.yellow('live-mock')} ${chalk.yellow('不存在，准备创建文件夹...')}\n`)
  //   initFolder(cwd);
  // }

  process.on("SIGINT", () => {
    process.exit();
  })

  process.on('SIGHUP', () => {
    process.exit();
  });

  process.on('SIGTERM', () => {
    process.exit();
  });
}

boot();
