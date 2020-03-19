#!/usr/bin/env node

var program = require('commander');
var startIntercept = require('../lib/main').default;

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

  startIntercept(port);
