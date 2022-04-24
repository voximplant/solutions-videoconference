const { prepareResponse } = require('../../functions');

module.exports = async (ctx) => {
  return ctx.send(prepareResponse(null, ctx.response.message, ctx.response.status));
};
