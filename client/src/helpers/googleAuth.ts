import appConfig from '@/config';

const redirectUri = `${appConfig.baseUrl}auth`;

function getRedirectUrl(): string {
  const queries = [
    `client_id=${appConfig.clientId}`,
    `redirect_uri=${redirectUri}`,
    'scope=email profile',
    'response_type=code',
  ];

  return `${appConfig.baseAuthRedirectUrl}?${queries.join('&')}`;
}

export { getRedirectUrl, redirectUri };
