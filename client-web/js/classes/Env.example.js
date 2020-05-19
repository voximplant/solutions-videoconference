const Env = {
  baseUrl: '/',
  replaceHistoryPrefix: '/',
  url: 'https://example.com',
  getServiceIdFromUrl: function (url) {
    const params = url.pathname.split('/');
    if (params.length === 2) return params[1];
    return null;
  },
  sendUID: true,
  credentials: {
    userName: 'user',
    accountName: 'app',
    appName: 'acc',
    password: 'securepass',
  },
};

export default Env;
