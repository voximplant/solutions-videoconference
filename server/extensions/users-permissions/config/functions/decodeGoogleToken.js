const { OAuth2Client } = require('google-auth-library');

async function decodeGoogleToken({ idToken, clientId }) {
  const client = new OAuth2Client(clientId);
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: clientId,
    });

    return ticket.getPayload();
  } catch (e) {
    strapi.log.error(e);
    return null;
  }
}

module.exports = decodeGoogleToken;
