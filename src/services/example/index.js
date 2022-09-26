const { http } = require('node-service-library');

const { hello } = require('./api');

module.exports = http({
  GET: {
    hello
  },
  POST: {},
  PUT: {},
  DELETE: {}
});
