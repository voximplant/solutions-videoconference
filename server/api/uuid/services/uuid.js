'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

const { generateUuid } = require('../config/functions');
const { messages } = require('../../../config/functions');

module.exports = {
  shrinkUuid: async (uuid, user) => {
    // check if it exists
    const model = 'uuid';
    const existing = await strapi.query(model, '').findOne({ long: uuid });
    if (existing) {
      return {
        error: messages.uuidAlreadyExists,
      };
    }

    let isShortUuidUnique = false;
    let shortUuid = generateUuid(uuid);

    const maxTries = 1000;
    let currentTry = 0;
    while (!isShortUuidUnique) {
      if (currentTry >= maxTries) {
        strapi.log.error(messages.uuidNoMoreUuids);
        return {
          error: messages.uuidNoMoreUuids,
        };
      }

      const exists = await strapi.query(model, '').findOne({ short: shortUuid });
      if (exists) {
        shortUuid = generateUuid(uuid);
        currentTry++;
        strapi.log.warn(`Uuid collision detected. Last short uuid ${shortUuid}. Retry #${currentTry}`);
      } else {
        isShortUuidUnique = true;
        await strapi.query(model, '').create({
          long: uuid,
          short: shortUuid,
          user: user.id,
        });
      }
    }

    return {
      shortUuid,
      is_owner: true,
    };
  },

  unshrinkUuid: async (uuid, user) => {
    // check if it exists
    const model = 'uuid';
    const existing = await strapi.query(model, '').findOne({ short: uuid });
    if (!existing) {
      return {
        error: messages.uuidNotExists,
        status: 404,
      };
    }

    return {
      info: {
        uuid: existing.long,
        is_owner: existing.user && existing.user.id === user.id,
      },
    };
  },
};
