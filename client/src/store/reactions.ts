import { createEvent, createStore } from 'effector';
import { emojiDefault } from '@/store/emojiList';
import { $users } from '@/store/users';
import { sendMessageToAll } from '@/store/chat/index';

const updateReaction = createEvent<ReactionEvent>();
const sendReaction = createEvent<LocalReactionEvent>();
const clearReaction = createEvent<string>();
const clearLocalReactions = createEvent();

interface LocalReactionEvent {
  type: string;
  active: boolean;
}

interface ReactionEvent extends LocalReactionEvent {
  userName: string;
}

const createLocalReactions = (emojilist: {
  [type: string]: string;
}): { [type: string]: boolean } => {
  const local: { [type: string]: boolean } = {};
  Object.keys(emojilist).forEach((type: string) => {
    local[type] = false;
  });
  return local;
};

const reactionsStore = createStore<{
  emojilist: { [type: string]: string };
  reactions: { [userName: string]: Set<string> };
  localReactions: { [type: string]: boolean };
}>({
  emojilist: emojiDefault,
  reactions: {},
  localReactions: createLocalReactions(emojiDefault),
})
  .on(updateReaction, (store, event) => {
    console.error('updateReaction', event, store);
    if (!store.reactions[event.userName]) store.reactions[event.userName] = new Set();
    if (event.active) {
      store.reactions[event.userName].add(event.type);
    } else {
      store.reactions[event.userName].delete(event.type);
    }

    return { ...store };
  })
  .on(clearReaction, (store, endpointId: string) => {
    const user = $users.getState().users.find((user) => user.endpointId === endpointId);
    if (user) store.reactions[user.chatUser.userName].clear();
    return { ...store };
  })
  .on(clearLocalReactions, (store) => {
    const newStore = store;
    newStore.reactions = {};
    newStore.localReactions = {};
    return { ...newStore };
  })
  .on(sendReaction, (store, { type, active }) => {
    store.localReactions[type] = active;
    sendMessageToAll({
      text: `${active ? store.emojilist[type] : ''}`,
      customData: [{ command: 'reaction', type, active }],
    });
    return { ...store };
  });

export { reactionsStore, updateReaction, sendReaction, clearReaction, clearLocalReactions };
