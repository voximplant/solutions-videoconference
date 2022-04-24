'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

const fetch = require('node-fetch');

module.exports = () => {
  strapi.plugins['users-permissions'].services.voximplant.initVoxapi();

  if (!globalThis.fetch) {
    globalThis.fetch = fetch;
  }
};
