const messages = {
  voxUserNotFound: 'User not found in vox application',
  cantCreateVoxUser: 'Cant create user in vox application',
  userNotFound: 'User not found in strapi',

  specifyIdToken: 'id_token not specified in query params',
  specifyBodyIdToken: 'id_token not specified in POST body',
  specifyIdTokenOrCode: 'specify id_token for mobile app or code for web in query',
  idTokenInvalid: 'id_token is not valid',
  tokenInvalid: 'Provided token is not valid',
  jwtError: 'Failed to auth',
  unknownAuthProvider: 'Unknown auth provider',

  // user creation
  userOverflow: 'Unable to create user. Try to specify another email',

  // apple jwt
  jwtNoPublicKey: 'Validation failed, no public key found',
  jwtInvalidToken: 'Validation failed, token invalid',
  jwtFiledToFetchApple: 'Filed to fetch public keys from apple',

  rsaGenerate: 'Filed to generate public key',

  userNameNotSpecified: 'Specify userName in request body',

  emailNotSpecified: 'Email not specified. Check token scope',

  // uuid
  uuidNoSpecified: 'Specify uuid in request body',
  uuidAlreadyExists: 'Specified uuid already exists',
  uuidNotExists: 'Specified uuid not exists',
  uuidNoMoreUuids: 'All your uuid are belong to us, cant create new one',

  // common
  badRequest: 'Bad request',
};

module.exports = messages;
