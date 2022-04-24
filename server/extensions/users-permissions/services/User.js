const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  findOneByName: async (userName) => {
    const splitUserName = userName.split('@');
    if (splitUserName.length >= 2) splitUserName.pop();
    const clearedUserName = splitUserName.join('@');

    try {
      const userRaw = await strapi
        .query('user', 'users-permissions')
        .model.query((qb) => {
          qb.where({ username: clearedUserName });
        })
        .fetch({
          columns: '*',
          withRelated: [],
        });
      const user = userRaw?.toJSON?.();
      delete user.role;

      return sanitizeEntity(user, {
        model: strapi.query('user', 'users-permissions').model,
      });
    } catch (e) {
      strapi.log.error(e);
    }
  },
};
