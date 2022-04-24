import { Messaging } from '@voximplant/websdk/modules/messaging';

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
export type Conversation = Awaited<ReturnType<typeof Messaging.getConversation>>;
