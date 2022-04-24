const { messages, prepareResponse } = require('../../../config/functions');
module.exports = {
  async getVoxOTT(ctx) {
    const {
      request: { body },
      state: { user },
    } = ctx;

    const { one_time_key: key } = body;

    const ottInfo = await strapi.plugins['users-permissions'].services.voximplant.getVoxOTT({
      user,
      apiKey: key,
    });
    return prepareResponse(ottInfo, messages.userNotFound);
  },
};
