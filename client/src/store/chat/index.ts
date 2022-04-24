import { createEffect, createEvent, createStore } from 'effector';
import { ChatStore } from '@/store/chat/ChatStore';
import { Conversation } from '@/store/chat/Conversation';
import { Message } from '@/store/chat/Message';

const $chatContent = createStore<ChatStore>({});

const createChat = createEffect<void, Conversation, void>();
const joinChat = createEffect<string, Conversation, void>();
const fetchInitialData = createEffect<Conversation, { messages: Message[] }, void>();
const subscribeChat = createEvent<Conversation>();
const clearChat = createEvent();
const updateChatContent = createEvent<any>(); // событие на обновление сообщения или реакции в чате
const sendMessageToAll = createEvent<{ text: string; customData?: any[] }>();

export {
  $chatContent,
  updateChatContent,
  createChat,
  joinChat,
  fetchInitialData,
  subscribeChat,
  clearChat,
  sendMessageToAll,
};
