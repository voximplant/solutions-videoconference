const crypto = require('crypto');

const generateHash = (userName, userPassword) => {
  const md5 = crypto.createHash('md5');
  return md5.update(`${userName}:voximplant.com:${userPassword}`).digest('hex');
};

module.exports = generateHash;
