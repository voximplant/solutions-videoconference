const sanitizeEntity = require('strapi-utils/lib/sanitize-entity');

const { prepareResponse, messages } = require('../../../config/functions');

module.exports = {
  getUserByName: async (ctx) => {
    const { userName } = ctx.params;
    const user = await strapi.plugins['users-permissions'].services.user.findOneByName(userName);
    return prepareResponse(user, messages.userNotFound, 404);
  },

  async me(ctx) {
    const user = ctx.state.user;

    const sanitizedUser = sanitizeEntity(user, {
      model: strapi.query('user', 'users-permissions').model,
    });

    return prepareResponse(sanitizedUser, messages.userNotFound, 404);
  },
};
