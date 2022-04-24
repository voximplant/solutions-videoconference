# Config
- add `.env` (see `.env.example`)

# In app config
## Config google oauth in `google console`
- open `https://console.cloud.google.com/apis/credentials`
- create credentials or edit existing
- specify `URIs` and `Authorized redirect URIs`. Redirect should be `{{frontend}}/auth-endpoint`,
  or `http://localhost:8080/auth` for local development (see frontend example)
- save `Client ID`, `Client Secret` and set it into backend provider config
  
## Enable endpoints
- open `{{backendUrl}}/admin/settings/users-permissions/roles`
- select role
- expand `Application` spoiler
- in `users-permissions` group check allowed endpoints. Select at least `googleauth`, `getvoxott` and `me`
- click save

# Google oauth logic 
## web
- request auth `code` by open url `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=email profile&response_type=code`
- select google account to login
- get `code` from url query and GET request to `${backendUrl}/auth?code=${code}`
- get `jwt` from response json for future service requests; also authed user info provided in request
- GET request to `${backendUrl}/users/me` with authorization bearer token to get user info
- POST request to `${backendUrl}/get-vox-token` with authorization bearer token, one_time_key in body to get ott

## mobile
- request `id_token` or `code` from your app
- select google account to login
- get `code` from url query and GET request to `${backendUrl}/auth?id_token=${id_token}`
- get `jwt` from response json for future service requests; also authed user info provided in request
- GET request to `${backendUrl}/users/me` with authorization bearer token to get user info
- POST request to `${backendUrl}/get-vox-token` with authorization bearer token, one_time_key in body to get ott

# Available endpoints

### `/get-vox-token`
- POST `/get-vox-token`
- returns voximplant app user's one time token and user data 
- only for authed users
- Body (application/json):
  - one_time_key - return one time token in `ott` field and `user` data

### `/users/:userName`
- method `GET`
- returns user info by name
- only for authed users

# Start dev
```
yarn
yart develop
```

# Start production
```
yarn start
```

# Start production in pm2
```
yarn start:pm2
```
