const nodeRSA = require('node-rsa');
const messages = require('../../../../config/functions/messages');

const generatePublicKey = (modulus, exponent) => {
  try {
    const key = new nodeRSA();
    const encodedModulus = Buffer.from(modulus, 'base64');
    const encodedExponent = Buffer.from(exponent, 'base64');
    const pubKey = key.importKey({ n: encodedModulus, e: encodedExponent }, 'components-public');
    return pubKey.exportKey('pkcs8-public-pem');
  } catch (e) {
    strapi.log.error(`[generatePublicKey] ${messages.rsaGenerate} `, e);
  }
};

module.exports = {
  generatePublicKey,
};
