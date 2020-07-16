#!/usr/bin/env node
const fs = require("fs")
var program = require('commander');
const path = require("path")
const _ = require('lodash')
const chalk = require('chalk');
const glob = require('glob');
const createMock = require('../lib/server/server').default;
const { mockDir } = require('../lib/server/mock/_constant')

const globOptions = {
  root: process.cwd(),
  ignore: ["**/node_modules/**"],
}

function initFolder(cwd) {
  const targetDirPath = path.resolve(cwd, mockDir)
  const mockDirs = glob.sync('**/live-mock', globOptions).concat(glob.sync(`**/${mockDir}`, globOptions));
  if (!mockDirs.length) {
    console.log(chalk.yellow('未发现smock或live-mock文件夹，自动创建中...'));
    fs.mkdirSync(targetDirPath);
    console.log(`${chalk.yellow('文件夹创建成功，文件夹位置：')}${chalk.green(targetDirPath)}`);
    console.log(chalk.yellow('创建demo文件中...'));
    fs.writeFileSync(path.resolve(targetDirPath, 'demo.json5'), fs.readFileSync(path.resolve(__dirname, 'demo.json5')), 'utf8')
    fs.writeFileSync(path.resolve(targetDirPath, 'demo.js'), fs.readFileSync(path.resolve(__dirname, 'demo.js')), 'utf8')
    fs.writeFileSync(path.resolve(targetDirPath, 'demo.ts'), fs.readFileSync(path.resolve(__dirname, 'demo.ts')), 'utf8')
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
