'use strict';
const { prepareResponse, messages, getParamsFromContext } = require('../../../config/functions');
const applicationId = process.env.APPLICATION_ID;

module.exports = {
  async authController(ctx) {
    const user = await strapi.plugins['users-permissions'].controllers.auth.authUserByProvider(ctx);
    if (!user?.id) return prepareResponse(null, user.error ?? messages.jwtError, user.status);

    const voxUser = await strapi.plugins['users-permissions'].services.auth.authVox({
      strapiUser: user,
      userName: user.username,
      displayName: user.display_name,
      applicationId,
    });

    if (!voxUser) return prepareResponse(null, messages.cantCreateVoxUser);

    const userInfo = await strapi.plugins['users-permissions'].services.auth.updateStrapiUser({
      strapiUser: user,
      voxUser,
    });

    return prepareResponse(userInfo, messages.jwtError);
  },

  async authUserByProvider(ctx) {
    const { provider } = getParamsFromContext(ctx, { provider: 'google' });
    try {
      switch (provider) {
        case 'apple':
          return await strapi.plugins['users-permissions'].controllers.auth.appleAuth(ctx);
        case 'google':
          return await strapi.plugins['users-permissions'].controllers.auth.googleAuth(ctx);
        default:
          return { status: 400, error: messages.unknownAuthProvider };
      }
    } catch (e) {
      return { status: 400, error: e.message };
    }
  },

  async appleAuth(ctx) {
    const { id_token: idToken, display_name: displayName, picture } = getParamsFromContext(ctx);

    if (!idToken) return prepareResponse(null, messages.specifyBodyIdToken);
    const {
      payload: decodedToken,
      error,
      status,
    } = await strapi.plugins['users-permissions'].services.auth.authAppleMobile(idToken);

    if (!decodedToken) return prepareResponse(null, error, status);
    const enrichedToken = strapi.plugins['users-permissions'].services.auth.enrichAppleToken({
      decodedToken,
      displayName,
      picture,
    });

    const user = await strapi.plugins['users-permissions'].services.auth.authStrapi(enrichedToken, 'apple');
    return user;
  },

  async googleAuth(ctx) {
    const { id_token: idToken, redirect_url: redirectUrl, code } = getParamsFromContext(ctx);

    if (!idToken && !code) return prepareResponse(null, messages.specifyIdTokenOrCode);

    const decodedToken = idToken
      ? await strapi.plugins['users-permissions'].services.auth.authGoogleMobile(idToken)
      : await strapi.plugins['users-permissions'].services.auth.authGoogleWeb(code, redirectUrl);

    if (!decodedToken) return prepareResponse(null, messages.tokenInvalid);

    const user = await strapi.plugins['users-permissions'].services.auth.authStrapi(decodedToken);
    return user;
  },
};
