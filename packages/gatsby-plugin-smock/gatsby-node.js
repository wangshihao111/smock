const { createExpressMiddleware } = require('@smock/mock/lib/server/server');

module.exports = {
  onCreateDevServer(api) {
    const { app } = api;
    if (process.env.NO_SMOCK !== 'true') {
      app.use(createExpressMiddleware())
    }
  }
}