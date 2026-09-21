const app = require('../dist/index.mjs');

module.exports = (req, res) => {
  app.default(req, res);
};