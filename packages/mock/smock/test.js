module.exports = {
  name: '6666666666',
  apis: [
    {
      name: 'test-new',
      url: '/test-new',
      method: 'get',
      handle(req, res) {
        res.send('xxx');
      }
    }
  ]
}
