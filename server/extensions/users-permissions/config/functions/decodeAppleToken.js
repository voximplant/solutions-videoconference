const jwt = require('jsonwebtoken');
const messages = require('../../../../config/functions/messages');
const { generatePublicKey } = require('./publicKeys');

let appleKeyMap = {};

function cleanAppleKeys() {
  const maxKeys = 1000;
  if (Object.keys(appleKeyMap).length >= maxKeys) appleKeyMap = {};
}

async function updateAppleKeys() {
  const appleKeysUrl = 'https://appleid.apple.com/auth/keys';
  try {
    const response = await fetch(appleKeysUrl);
    const { keys } = await response.json();

    cleanAppleKeys();

    keys?.map((key) => {
      appleKeyMap[key.kid] = key;
      appleKeyMap[key.kid].publicKey = generatePublicKey(key.n, key.e);
    });
  } catch (e) {
    strapi.log.error(`[updateAppleKeys] ${messages.jwtFiledToFetchApple} `, e);
  }
}

/**
 *
 * @param {jwt} idToken
 * @param {string} clientId
 * @return {Promise<{isValid?: boolean, payload?: any, error?: any}>}
 */
async function parseAppleToken({ idToken, clientId }) {
  const decodedToken = jwt.decode(idToken, { complete: true });
  if (!decodedToken) return { error: messages.tokenInvalid };
  const {
    header: { kid, alg },
  } = decodedToken;

  if (!appleKeyMap[kid]) {
    await updateAppleKeys();
  }

  const publicKey = appleKeyMap[kid]?.publicKey;
  if (!publicKey) {
    strapi.log.error(`[validateAppleToken] ${messages.jwtNoPublicKey}`);
    return { error: messages.jwtNoPublicKey };
  }

  try {
    const verifiedToken = jwt.verify(idToken, publicKey, {
      algorithms: [alg],
      audience: clientId,
      issuer: 'https://appleid.apple.com',
    });
    return { isValid: true, payload: verifiedToken };
  } catch (e) {
    switch (e.name) {
      case 'TokenExpiredError': {
        strapi.log.error(`[validateAppleToken] ${e.message}`);
        return { error: e.message, status: 401 };
      }
      default: {
        strapi.log.error(`[validateAppleToken] ${messages.jwtInvalidToken}`);
        return { error: messages.jwtInvalidToken };
      }
    }
  }
}

async function decodeAppleToken({ idToken, clientId }) {
  const parsedResult = await parseAppleToken({ idToken, clientId });
  return parsedResult;
}

module.exports = decodeAppleToken;
