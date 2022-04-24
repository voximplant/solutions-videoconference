import { Message } from '@/store/chat/Message';
import { Conversation } from '@/store/chat/Conversation';

export interface ChatStore {
  currentConversation?: Conversation; // содержит данные текущей конференции
  messages?: Message[]; // содержит список сообщений и реакций с данными отправителя
}
