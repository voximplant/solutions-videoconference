/**
 * Auth module
 */
import { createEffect, createEvent, createStore } from 'effector';
import appConfig from '@/config';
import { auth, SDK } from '@voximplant/websdk';
import { ConsoleLogger } from '@voximplant/websdk/modules/logger';
import { MessagingLoader } from '@voximplant/websdk/modules/messaging';
import { WebrtcLoader } from '@voximplant/websdk/modules/webrtc';
import { ConferenceLoader } from '@voximplant/websdk/modules/conference';
import { updateMe } from '@/store/users';

enum AuthState {
  NoAuth,
  OAuth,
  Processing,
}

interface getMeData {
  data: {
    blocked: boolean;
    confirmed: boolean;
    created_at: string;
    display_name: string;
    email: string;
    id: number;
    picture: string;
    provider: string;
    updated_at: string;
    username: string;
    vox_user_id: string;
  };
  jwt: string;
  status?: number;
}

interface AuthToken {
  jwt: string;
  email: string;
  displayName: string;
  voxUserId: string;
  username: string;
  picture: string;
}

interface AuthStore extends Partial<AuthToken> {
  authState: AuthState;
}

const restoreAuth = createEffect<void, getMeData, void>(async () => {
  updateState(AuthState.Processing);
  const jwt = localStorage.getItem('auth-conf');
  if (jwt) {
    const response = await fetch(`${appConfig.baseServerUrl}users/me`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    });
    const data = await response.json();
    if (data.data.username) {
      await authSDK(data.data.username, jwt || '');
    }
    updateMe(data.data);
    if (data.error) {
      updateState(AuthState.NoAuth);
      throw Error(data.error);
    }
    return { ...data, jwt };
  }
  updateState(AuthState.NoAuth);
  throw Error('Local storage is empty');
});

const makeAuth = createEffect<{ code: string; redirectUri: string }, AuthStore, void>(
  async ({ code, redirectUri }): Promise<AuthStore> => {
    updateState(AuthState.Processing);
    const response = await fetch(
      `${appConfig.baseServerUrl}auth?code=${code}&redirect_url=${redirectUri}`
    );
    const json = await response.json();
    if (json.result) {
      await authSDK(json.data.user.username, json.data.jwt);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      updateMe();
      return {
        authState: AuthState.OAuth,
        jwt: json.data.jwt,
        username: json.data.user.username,
        displayName: json.data.user.display_name,
        email: json.data.user.email,
        voxUserId: json.data.user.vox_user_id,
        picture: json.data.user.picture,
      };
    }
    updateState(AuthState.NoAuth);
    throw Error('Not auth');
  }
);

const authStore = createStore<AuthStore>({ authState: AuthState.NoAuth });
const updateState = createEvent<AuthState>();

authStore
  .on(updateState, (store, newState) => {
    store.authState = newState;
    return { ...store };
  })
  .on(restoreAuth.doneData, (store, params) => {
    if (params.status === 401) {
      localStorage.removeItem('auth-conf');
      return store;
    } else {
      return {
        jwt: params.jwt,
        authState: AuthState.OAuth,
        displayName: params.data.display_name,
        email: params.data.email,
        picture: params.data.picture,
        username: params.data.username,
        voxUserId: params.data.vox_user_id,
      };
    }
  });
authStore.on(makeAuth.doneData, (_, params) => {
  if (params.jwt) localStorage.setItem('auth-conf', params.jwt);
  return params;
});

const makeAuthHeaders = (): Record<string, string> => {
  const { jwt } = authStore.getState();
  return {
    authorization: `Bearer ${jwt}`,
  };
};

const authSDK = async (username: string, jwt: string) => {
  await SDK.configure({
    connection: {},
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    logger: new ConsoleLogger({ logLevel: 'trace' }),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    modules: [MessagingLoader(), WebrtcLoader(), ConferenceLoader()],
  });
  await SDK.connect();
  const authMethod = new auth.OtpAuth({
    username: `${username}@${appConfig.voxAppDomain}`,
    onOneTimeLoginKey: async (one_time_key) => {
      const response = await fetch(`${appConfig.baseServerUrl}get-vox-token`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${jwt}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ one_time_key }),
      });
      const json = await response.json();
      return json.data?.ott || '0';
    },

    options: {},
  });
  await SDK.login(authMethod);
};

export { authStore, AuthState, restoreAuth, makeAuth, makeAuthHeaders };
