import { Injectable, OnDestroy } from '@angular/core';
import * as VoxImplant from 'voximplant-websdk';
import { DataBusMessageType, DataBusService, IDataBusChatMessage, IDataBusMessage, Route } from './data-bus.service';
import { IIDClass } from './interfaces/IIDClass';
import { createLogger } from '@core';
import { Messaging } from 'voximplant-websdk/Messaging';
import { Conversation } from 'voximplant-websdk/Messaging/src/Conversation';

import { Subscription } from 'rxjs';
import { IChatMessage } from './/interfaces/IChatMessage';

interface IVIMessage {
  conversation: string;
  payload: {
    connectionId: string;
    displayName: string;
    time: string;
  }[];
  sender: string;
  text: string;
  uuid: string;
}

@Injectable()
export class ChatManagerService implements IIDClass, OnDestroy {
  readonly ID = 'ChatManagerService';
  private logger = createLogger(this.ID);
  messages: any[] = [];
  private _messenger: Messaging.Messenger;
  private conversation: Conversation;
  private isOwner = false;
  connectionId: any;
  private displayName: string;
  private subscriptions: Subscription = new Subscription();
  constructor(private dataBusService: DataBusService) {
    this.subscriptions.add(
      this.dataBusService.inner$.pipe().subscribe((message: IDataBusMessage) => {
        switch (message.type) {
          case DataBusMessageType.JoinToChat:
            let payload = message.data.payload;

            if (payload.owner) {
              this.logger.log('payload for owner', payload);
              if (!payload.roomId) {
                this.create();
              } else {
                this.join(payload.roomId);
              }
            } else {
              this.logger.log('payload for non-owner', payload);
              if (payload.roomId) {
                this.join(payload.roomId);
              }
            }
            break;

          case DataBusMessageType.SendMessageToChat:
            {
              this.sendMessage(message.data.text);
            }
            break;
        }
      })
    );
  }

  // we need it after authorized
  get messenger() {
    if (!this._messenger) {
      this._messenger = VoxImplant.getMessenger();
      this.bindEvents();
    }
    return this._messenger;
  }

  bindEvents() {
    this._messenger.on(VoxImplant.Messaging.MessengerEvents.SendMessage, (e: any) => {
      if (e.message.conversation === this.roomId) {
        this.logger.info(' new message', e);
        this.addMessageByEvent(e);
      }
    });
  }

  get roomId() {
    return this.conversation && this.conversation.uuid;
  }

  create() {
    this.logger.info('create new conversation');
    const title = '';
    this.messenger
      .createConversation([], title, false, true)
      //CreateConversationEvent
      .then((e) => {
        this.conversation = e.conversation;

        this.isOwner = true;
        const message = `{"event":"set_room_id","roomId":"${this.roomId}"}`;
        this.dataBusService.send({
          data: message,
          route: [Route.Inner],
          sign: this.ID,
          type: DataBusMessageType.SendMessageToCall,
        });
        this.logger.info(`send message:${message}`);
      })
      .catch((reason) => {
        this.logger.error('Fail join to conversation', reason);
      });
  }

  join(roomId: any) {
    if (this.roomId) {
      this.logger.info(`already joined to exist conversation roodId${this.roomId}. Skip join to:${roomId}`);
      return;
    }
    this.logger.info('join to exist conversation', roomId);
    this.messenger
      .getConversation(roomId)
      //https://voximplant.com/docs/references/websdk/voximplant/messaging/eventhandlers/editconversationevent
      .then((e) => {
        this.logger.info('Success! joined to exist conversation');
        this.conversation = e.conversation;
        this.getLastMessages();
        //this.sendMessage('ping');
      })
      .catch((reason) => {
        this.logger.error('Fail join to conversation', reason);
      });
  }

  getLastMessages() {
    if (this.conversation) {
      let first = 1;
      let last = this.conversation.lastSeq;
      if (this.conversation.lastSeq > 99) {
        first = this.conversation.lastSeq - 99;
      }
      this.conversation
        .retransmitEvents(first, last)
        // RetransmitEventsEvent
        .then((ev: any) => {
          //RetransmittedEvent[]
          ev.events
            //RetransmittedEvent
            .forEach((event: any) => this.addMessageByEvent(event));
        })
        .catch((e) => {
          this.logger.warn(' retransmitEvents fail', JSON.stringify(e));
        });
    } else {
      this.logger.warn('Trying to get last messages from non-existing conversation');
    }
  }

  setConnectionId(connectionId: string) {
    this.connectionId = connectionId;
  }
  setDisplayName(name: string) {
    this.displayName = name;
  }

  /**
   * RetransmittedEvent
   * @param event
   */
  addMessageByEvent(event: { message: IVIMessage }) {
    if (event.message) {
      this.messages.push(event.message);
      //message send
      this.addChatMessage(event.message);
    }
  }

  addChatMessage = (message: IVIMessage) => {
    const payload = message.payload[0];
    this.dataBusService.send(<IDataBusChatMessage>{
      type: DataBusMessageType.ChatMessage,
      data: <IChatMessage>{
        id: message.uuid,
        payload: payload,
        text: message.text,
        conversation: message.conversation,
      },
      route: [Route.Inner],
      sign: this.ID,
    });
  };

  /**
   * От кого именно это сообщение - будем хранить вот тут
   * (https://voximplant.com/docs/references/websdk/voximplant/messaging/message#conversation) в формате
   * {displayName:'DISPLAY_NAME', connectionId:'CONNECTION_ID'}  CONNECTION_ID нужно брать тот же, что и отправляется в заголовке 'X-UUID' в callConference
   * @param text
   */
  sendMessage = (text: string) => {
    this.conversation.sendMessage(text, [
      { displayName: this.displayName, connectionId: this.connectionId, time: Date.now() },
    ]);
  };

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
