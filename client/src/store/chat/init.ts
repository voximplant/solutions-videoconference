import { Message } from '@/store/chat/Message';
import { $users, updateUsers, User } from '@/store/users';
import { Conversation } from '@/store/chat/Conversation';
import { Messaging, Events } from '@voximplant/websdk/modules/messaging';
import {
  createChat,
  updateChatContent,
  joinChat,
  fetchInitialData,
  $chatContent,
  subscribeChat,
  clearChat,
  sendMessageToAll,
} from '@/store/chat/index';
import { updateReaction } from '@/store/reactions';

const formatMessage = (message: any): Message => {
  const senderId = message.initiator || message.message.sender;
  const allUsers = [...$users.getState().users, $users.getState().me];
  const user: User | undefined = allUsers?.find((user) => user?.chatUser.userId === senderId);
  if (!user) throw Error('Cannot find user for received message');
  return {
    name: user?.chatUser.displayName,
    time: Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(message.timestamp),
    avatar: user?.authUser?.avatar,
    message: message.message.text,
  };
};

createChat.use(async () => {
  try {
    // https://voximplant.com/docs/references/websdk/voximplant/messaging/messenger#createconversation
    return Messaging.createConversation({
      customData: {},
      direct: false,
      enablePublicJoin: true,
      participants: [],
      uberConversation: false,
      title: 'Conference group chat',
    });
  } catch (e) {
    throw Error(`Cannot create a conversation: ${e.message}`);
  }
});

// joining an existing chat of a new user
joinChat.use(async (uuid) => {
  // https://voximplant.com/docs/references/websdk/voximplant/messaging/messenger#joinconversation
  try {
    return await Messaging.joinConversation(uuid);
  } catch (e) {
    return await Messaging.getConversation(uuid);
  }
});

fetchInitialData.use(async (currentConversation: Conversation) => {
  const messages: Message[] = [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await updateUsers(currentConversation.participants.map((user) => user.user_id));
  const convEvents = await currentConversation?.retransmitEvents(
    Number(currentConversation?.lastSeq),
    50
  );
  convEvents?.forEach((ev: any) => {
    if (ev.messengerAction === 'sendMessage' && ev.message.text !== '') {
      messages.push(formatMessage(ev));
      //updateChatContent(ev);
    }
  });
  return { messages };
});

$chatContent
  .on(createChat.doneData, (currentStore, chat) => {
    fetchInitialData(chat);
    subscribeChat(chat);
    return { ...currentStore, currentConversation: chat };
  })
  .on(joinChat.doneData, (currentStore, chat) => {
    fetchInitialData(chat);
    subscribeChat(chat);
    return { ...currentStore, currentConversation: chat };
  })
  .on(fetchInitialData.doneData, (currentStore, { messages }) => {
    return { ...currentStore, messages };
  })
  .on(updateChatContent, (currentStore, newMessage) => {
    if (newMessage.message.payload && newMessage.message.payload[0]?.command === 'reaction') {
      const senderId = newMessage.initiator || newMessage.message.sender;
      const allUsers = [...$users.getState().users, $users.getState().me];
      const user = allUsers.find((userObj) => userObj?.chatUser.userId === senderId);
      if (!user) return console.warn('Cannot find user for a reaction from ' + senderId);
      updateReaction({
        userName: user.chatUser.userName,
        type: newMessage.message.payload[0].type,
        active: newMessage.message.payload[0].active,
      });
    }
    if (newMessage.message.text !== '') {
      currentStore.messages = [...(currentStore.messages || []), formatMessage(newMessage)];
    }
    return { ...currentStore }; // возвращаем обновлённый store
  })
  .on(subscribeChat, (store, chat) => {
    // receive a new chat message
    chat.addEventListener(Events.MessageReceived, (ev) => {
      updateChatContent(ev);
    });
    // a new user adding events
    chat.addEventListener(Events.UsersAdded, (ev) => {
      updateUsers(ev.usersId);
    });
  })
  .on(clearChat, (store) => {
    store.currentConversation?.removeEventListener(Events.MessageReceived);
    return {};
  })
  .on(sendMessageToAll, (store, { text, customData }) => {
    store.currentConversation?.sendMessage(text, customData || []);
  });
