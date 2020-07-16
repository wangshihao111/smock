const startInterceptor = require('@smock/interceptor/lib/main').default;

module.exports = {
  onCreateDevServer(api) {
    if (process.env.NO_SPROXY !== 'true' && process.env.NO_INTERCEPTOR !== 'true') {
      startInterceptor()
    }
  }
}