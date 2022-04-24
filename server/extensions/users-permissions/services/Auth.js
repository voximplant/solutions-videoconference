const { generatePassword, generateHash, decodeGoogleToken, decodeAppleToken } = require('../config/functions');
const sanitizeEntity = require('strapi-utils/lib/sanitize-entity');
const { messages } = require('../../../config/functions');
const { randomInt } = require('crypto');

module.exports = {
  async authGoogleMobile(idToken) {
    const mobileClientId = process.env.GOOGLE_AUTH_CLIENT_ID;
    const decodedToken = await decodeGoogleToken({ idToken, clientId: mobileClientId });
    return decodedToken;
  },

  async authAppleMobile(idToken) {
    const mobileClientId = process.env.APPLE_BOUNDLE_ID;
    const decodedToken = await decodeAppleToken({ idToken, clientId: mobileClientId });
    return decodedToken;
  },

  enrichAppleToken({ decodedToken, displayName, picture = null }) {
    return {
      ...decodedToken,
      email: decodedToken.email ?? `${decodedToken.sub}@fakeapplemail.com`,
      name: displayName ?? decodedToken.sub,
      picture,
    };
  },

  async authGoogleWeb(code, redirectUrl) {
    // exchange code to id_token
    const baseUrl = 'https://www.googleapis.com/oauth2/v4/token';
    const webClientId = process.env.GOOGLE_AUTH_CLIENT_ID;

    const body = {
      code,
      client_id: webClientId,
      client_secret: process.env.GOOGLE_AUTH_SECRET,
      redirect_uri: redirectUrl ?? process.env.GOOGLE_AUTH_REDIRECT_URI,
      grant_type: 'authorization_code',
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const json = await response.json();
    const { id_token: idToken } = json;

    const decodedToken = await decodeGoogleToken({ idToken, clientId: webClientId });
    return decodedToken;
  },

  async authStrapi(decodedToken, provider = 'google') {
    const email = decodedToken.email;
    if (!email) {
      strapi.log.error(`${messages.emailNotSpecified}. Decoded token ${JSON.stringify(decodedToken)}`);
      throw new Error(messages.emailNotSpecified);
    }

    const username = decodedToken.email?.split('@')?.[0] ?? decodedToken.email;
    const displayName = decodedToken.name ?? username;
    const picture = decodedToken.picture ?? '';

    const user = await strapi.query('user', 'users-permissions').findOne({
      email,
    });

    const advanced = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'advanced',
      })
      .get();

    // Retrieve default role.
    const defaultRole = await strapi.query('role', 'users-permissions').findOne({ type: advanced.default_role }, []);

    if (user) {
      // auth user
      const newProvider = user.provider.includes(provider) ? user.provider : `${user.provider},${provider}`;

      const fieldsToUpdate = {
        display_name: displayName,
        provider: newProvider,
        picture,
        last_login: new Date(),
      };
      const updatedUser = await strapi.query('user', 'users-permissions').update({ id: user.id }, fieldsToUpdate);
      return updatedUser;
    } else {
      // Create the new user.
      const sameNamedUser = await strapi.query('user', 'users-permissions').findOne({
        username,
      });
      let usernameToStore = username;
      if (sameNamedUser) {
        const maxTries = 10000;
        for (let i = 0; i <= maxTries; i++) {
          usernameToStore = username + String(randomInt(10000000, 99999999));
          const sameNamedUserCheck = await strapi.query('user', 'users-permissions').findOne({
            username: usernameToStore,
          });

          if (!sameNamedUserCheck) break;
          if (i === maxTries) {
            strapi.log.error(`${messages.userOverflow}. Tied with username ${username}, email ${email}`);
            throw new Error(messages.userOverflow);
          }
        }
      }

      const profile = {
        email,
        username: usernameToStore,
        display_name: displayName,
        provider,
        picture,
        role: defaultRole.id,
        confirmed: true,
      };

      const createdUser = await strapi.query('user', 'users-permissions').create(profile);
      return createdUser;
    }
  },

  async authVox({ userName, displayName, applicationId }) {
    const voxClient = await strapi.plugins['users-permissions'].services.voximplant.client;
    const voxUsers = await voxClient.Users.getUsers({
      userName,
      applicationId,
    });

    if (voxUsers.error) {
      strapi.log.error(voxUsers.error);
      return null;
    }

    const voxUser = voxUsers?.result?.[0];

    if (!voxUser) {
      // create new user
      const userPassword = generatePassword();
      const newUser = await voxClient.Users.addUser({
        applicationId,
        userName,
        userDisplayName: displayName,
        userPassword,
      });

      const { userId } = newUser;

      return {
        hash: generateHash(userName, userPassword),
        userId: userId,
      };
    }

    // try to auth from fake strapi account
    // i.e. account was created for user@gmail.com, but try to login from user@notgmail.com
    // if (!voxUser || strapiUser.vox_user_id !== voxUser?.userId) return null;

    // update vox pass, strapi hash field
    const newPassword = generatePassword();
    const isUpdated = await voxClient.Users.setUserInfo({
      userName,
      applicationId,
      userPassword: newPassword,
      userDisplayName: displayName,
    });

    if (!isUpdated?.result) return null;

    return {
      hash: generateHash(userName, newPassword),
      userId: voxUser?.userId,
    };
  },

  async updateStrapiUser({ strapiUser, voxUser }) {
    const updatedUser = await strapi.query('user', 'users-permissions').update(
      { id: strapiUser.id },
      {
        vox_user_id: voxUser.userId,
        vox_hash: voxUser.hash,
      }
    );

    const userInfo = {
      jwt: strapi.plugins['users-permissions'].services.jwt.issue({
        id: updatedUser.id,
      }),
      user: sanitizeEntity(updatedUser.toJSON ? updatedUser.toJSON() : updatedUser, {
        model: strapi.query('user', 'users-permissions').model,
      }),
    };

    return userInfo;
  },
};
