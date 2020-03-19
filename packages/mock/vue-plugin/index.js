const fs = require('fs');
const path = require('path');
const execa = require('execa');

module.exports = (api, projectOptions) => {

  api.registerCommand('live-mock', args => {
    const {host = 'localhost', port = 4000} = args;
    const cwd = process.cwd();
    const watchPath = path.resolve(cwd, 'live-mock');
    const args = ['--host', host, '--port', port];
    const scriptPath = path.resolve(__dirname, '../lib/index.js');
    let child;
    function startMock() {
      child = execa(`node ${scriptPath}`, args);
      child.stdout.on('data', buf => console.log(buf.toString()));
      child.stderr.on('data', buf => console.log(buf.toString()));
    };
    fs.watch(watchPath, () => {
      child.kill();
      startMock();
    })
  })
}