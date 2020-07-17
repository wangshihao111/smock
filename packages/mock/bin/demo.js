module.exports = {
  name: 'user js',
  desc: 'js apis',
  apis: [
    {
      name: 'hello one',
      desc: 'example 1',
      method: 'GET',
      url: '/test-js-1',
      handle: (req, res) => {
        res.status(200);
        res.send({
          code: 0,
          message: "hello smock."
        });
      }
    },
    {
      name: 'hello two',
      desc: 'example 2',
      method: 'POST',
      url: '/test-js-2',
      handle: (req, res) => {
        return {
          status: 200,
          data: {
            message: 'hello smock js.',
          }
        }
      }
    },
    {
      name: 'hello pathVariable',
      desc: 'example pathVariable',
      method: 'get',
      url: '/test-js-path/:id',
      handle: (req, res) => {
        return {
          status: 200,
          data: {
            message: `hello smock js. Your id is ${req.params.id}`,
          }
        }
      }
    }
  ],
}
