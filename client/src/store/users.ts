import { Messaging } from '@voximplant/websdk/modules/messaging';
import { createEffect, createEvent, createStore } from 'effector';
import appConfig from '@/config';

//type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

interface UserAuth {
  avatar?: string;
  authId?: string;
  username?: string;
}

interface User {
  chatUser: any;
  authUser?: UserAuth;
  inCall?: boolean;
  endpointId?: string;
}

interface UsersStore {
  me?: User;
  users: User[];
}

const $users = createStore<UsersStore>({
  me: void 0,
  users: [],
});
const clearUsers = createEvent();

const updateMe = createEffect<any, User, void>(async (user?) => {
  const myId = await Messaging.getMyId();
  const me = await Messaging.getUserById(myId);
  if (!user) {
    const jwt = localStorage.getItem('auth');
    return fetch(`${appConfig.baseServerUrl}users/me`, {
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    })
      .then((response) => response.json())
      .then((response) => ({
        chatUser: me.user,
        authUser: {
          authId: response.data.id,
          avatar: response.data.picture,
        },
        inCall: true,
        endpointId: 'local',
      }));
  } else {
    return {
      chatUser: me.user,
      authUser: {
        authId: user.id,
        avatar: user.picture,
      },
      inCall: true,
      endpointId: 'local',
    };
  }
});

const updateUsers = createEffect<any, User[], void>(
  async (usersId: string[]): Promise<User[]> => {
    usersId = usersId.filter((id) => id !== $users.getState().me?.chatUser.userId);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore TODO @irgalamarr fix websdk params type
    const chatUsers = await Messaging.getUsersById(usersId);
    const jwt = localStorage.getItem('auth-conf');
    return await Promise.all(
      chatUsers.map((user) => {
        return fetch(`${appConfig.baseServerUrl}users/${user.user.userName}`, {
          headers: {
            authorization: `Bearer ${jwt}`,
          },
        })
          .then((response) => response.json())
          .then((response) => ({
            chatUser: user.user,
            authUser: {
              authId: response.data.id,
              avatar: response.data.picture,
            },
            inCall: false,
          }));
      })
    );
  }
);

const updateUserInCall = createEvent<{ inCall: boolean; userName: string; endpointId: string }>();

$users
  .on(updateUsers.doneData, (store, users) => {
    store.users = [...store.users, ...users];
    return { ...store };
  })
  .on(clearUsers, (store) => {
    store.users = [];
    return { ...store };
  })
  .on(updateMe.doneData, (store, me) => {
    console.error('updateMe', me);
    store.me = me;
    return { ...store };
  })
  .on(updateUserInCall, (store, { inCall, userName, endpointId }) => {
    const user = store.users.find((user) => user.chatUser?.userName.includes(userName));
    if (!user) setTimeout(() => updateUserInCall({ inCall, userName, endpointId }), 500);
    if (user) {
      user.inCall = inCall;
      if (inCall) user.endpointId = endpointId;
      const filtered = store.users.filter(
        (storeUser) => storeUser.chatUser?.userId !== user.chatUser.userId
      );
      store.users = [...filtered, user];
    }
    return { ...store };
  });

export { User, $users, updateUsers, updateMe, updateUserInCall, clearUsers };
