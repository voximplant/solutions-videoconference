const crypto = require('crypto');
const anyBase = require('any-base');

const generateUuid = (seed = '4fhu8923') => {
  const md5 = crypto.createHash('md5');
  const hash = md5.update(`${seed}:${Date.now()}`).digest('hex');
  const allowedChars = '123456789abcdefghjkmnpqrstuvwxyz';
  const hexToHR = anyBase(anyBase.HEX, allowedChars);
  const basedHash = hexToHR(hash);
  const splicedHashArray = Array.from(basedHash).splice(0, 14);
  splicedHashArray[4] = '-';
  splicedHashArray[9] = '-';
  return splicedHashArray.join('');
};

module.exports = {
  generateUuid,
};
