'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { prepareResponse, messages } = require('../../../config/functions');
module.exports = {
  // get long one
  getShortUUID: async (ctx) => {
    try {
      const {
        request: { body },
        state: { user },
      } = ctx;

      const { uuid } = body;

      if (!uuid) return prepareResponse(null, messages.uuidNoSpecified);

      const { shortUuid, error } = await strapi.services.uuid.shrinkUuid(uuid, user);

      if (error) return prepareResponse(null, error);

      return prepareResponse({
        uuid: shortUuid,
        is_owner: true,
      });
    } catch (e) {
      strapi.log.error(e);
      return prepareResponse(null, messages.badRequest);
    }
  },

  getLongUUID: async (ctx) => {
    const {
      request: { body },
      state: { user },
    } = ctx;
    const { uuid } = body;

    if (!uuid) return prepareResponse(null, messages.uuidNoSpecified);

    try {
      const { info, error, status } = await strapi.services.uuid.unshrinkUuid(uuid, user);
      if (error) return prepareResponse(null, error, status);

      return prepareResponse(info);
    } catch (e) {
      strapi.log.error(e);
      return prepareResponse(null, messages.badRequest);
    }
  },
};
