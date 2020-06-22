var startIntercept = require('@smock/interceptor/lib/main').default;

module.exports = (api, projectOptions) => {

  if (( !process.env.NODE_ENV || process.env.NODE_ENV==='development') && (!process.env.NO_INTERCEPTOR || NO_INTERCEPTOR === 'false')) {
    startIntercept();
  }

  api.registerCommand('sproxy', {
    options: {
      '-p --port <port>': '指定运行端口'
    }
  }, args => {

    startIntercept(args.port);
  })
}