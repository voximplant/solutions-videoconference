const decodeGoogleToken = require('./decodeGoogleToken');
const decodeAppleToken = require('./decodeAppleToken');
const generatePassword = require('./generatePassword');

// const generateToken = require('./generateToken');
const generateHash = require('./generateHash');

// const generateAccessToken = require('./generateAccessToken');
const generateOneTimeAccessToken = require('./generateOneTimeAccessToken');

module.exports = {
  decodeGoogleToken,
  decodeAppleToken,
  generateHash,
  generateOneTimeAccessToken,
  generatePassword,
};
