const crypto = require('crypto');

const pickRandom = (str) => str.charAt(Math.floor(Math.random() * str.length));

const generatePassword = (secret = '70q34fh%2234') => {
  const md5 = crypto.createHash('md5');
  const hash = md5.update(`${secret}:${Math.random()}:${Date.now()}`).digest('base64');
  const preparedHash = hash.replace(/=/g, '').split('');
  const chars = '(~!@#$%^&*_-+=`|\\(){}[]:;"\'<>,.?/)';
  const digits = '1234567890';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';

  // add some chars to pass password validation
  preparedHash[2] = pickRandom(chars);
  preparedHash[5] = pickRandom(upper);
  preparedHash[7] = pickRandom(lower);
  preparedHash[10] = pickRandom(digits);

  return preparedHash.join('');
};

module.exports = generatePassword;
