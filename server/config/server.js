module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'http://0.0.0.0:1337'),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'cdacfa5e586ab69bfabfe1ce02e60b8c'),
    },
  },
});
