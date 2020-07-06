const { createExpressMiddleware, default: createMock } = require('@smock/mock/lib/server/server');
const bodyParser = require('body-parser');

module.exports = (api, projectOptions) => {
  
  if(( !process.env.NODE_ENV || process.env.NODE_ENV === 'development') && (!process.env.NO_SMOCK || process.env.NO_SMOCK === 'false')) {
    api.configureDevServer((app) => {
      app.use(bodyParser.json());
      app.use(bodyParser.text());
      app.use(bodyParser.urlencoded({extended: true}));
      app.use(createExpressMiddleware());
    });
    global.__smock_mock = true;
  }

  api.registerCommand('smock', {
    options: {
      '-p --port <port>': 'specify working port<指定运行端口>'
    }
  }, args => {
    if (global.__smock_mock) {
      createMock({port: args.port})
    }
  })
}