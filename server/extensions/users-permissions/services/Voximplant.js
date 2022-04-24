'use strict';

const sanitizeEntity = require('strapi-utils/lib/sanitize-entity');

const VoximplantApiClient = require('@voximplant/apiclient-nodejs').default;
const path = require('path');
const { generateOneTimeAccessToken } = require('../config/functions');

const credsPath = path.resolve(__dirname, `../../../.private/${process.env.SERVICE_ACCOUNT_CREDS}`);

module.exports = {
  async getVoxOTT({ user, apiKey }) {
    const hash = user?.vox_hash;
    if (!hash) return null;

    return {
      ott: hash && apiKey ? generateOneTimeAccessToken(apiKey, hash) : null,
      user: sanitizeEntity(user, {
        model: strapi.query('user', 'users-permissions').model,
      }),
    };
  },

  // Client will be initialised after method initVoxapi
  client: null,

  async initVoxapi() {
    try {
      const client = new VoximplantApiClient(credsPath);

      client.onReady = () => {
        strapi.plugins['users-permissions'].services.voximplant.client = client;
      };
    } catch (e) {
      console.log(e);
    }
  },
};
