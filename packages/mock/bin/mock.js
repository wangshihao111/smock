#!/usr/bin/env node
/* eslint-disable */
const fs = require("fs")
const childProcess = require('child_process');
var program = require('commander');
const path = require("path")
const execa = require("execa")

console.log('开始运行mock工具...')
function kill(child, callback) {
  if (process.platform === "win32") {
    childProcess.exec('taskkill /pid ' + child.pid + ' /T /F', () => {
      callback && callback();
    });
  } else {
    child.kill();
    callback();
  }
}

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
const cwd = process.cwd()
const watchPath = path.resolve(cwd, "live-mock")
const args = ["--port", port]
const scriptPath = path.resolve(__dirname, "./start.js")
let child

function startMock() {
  console.log('启动Mock服务...')
  child = execa(`node ${scriptPath}`, args)
  child.stdout.on("data", buf => console.log(buf.toString()))
  child.stderr.on("data", buf => console.log(buf.toString()))
  child.catch(e => {console.log(e)});
}
fs.watch(watchPath, async () => {
  // await child.kill()
  kill(child,  () => {
    startMock()
  })
});

process.on("SIGINT", () => {
  kill(child, () => {
    process.exit();
  })
})

startMock()
