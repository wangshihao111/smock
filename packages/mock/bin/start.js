

var createMock = require('../lib/server/server').default;

var program = require('commander');
var createMock = require('../lib/server/server').default;

function bootstrap() {
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

  createMock({host: 'localhost', port});
}

bootstrap();

