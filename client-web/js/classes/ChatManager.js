import {AbstractLogging} from "./AbstractLogging.js";

class ChatManagerClass extends AbstractLogging{
  constructor() {
    super("ChatManagerClass");
    this._messenger = undefined;
    this.conversation = undefined;
    this.isOwner = false;
  }
 // we need it after authorized
  get messenger(){
    if(!this._messenger) {
      this._messenger = window.VoxImplant.getMessenger();
      this.bindEvents();
    }
    return this._messenger;
  }

  bindEvents(){
    this._messenger.on(VoxImplant.Messaging.MessengerEvents.SendMessage,(e)=>{
      this.logging(' new message', e);
      this.addMessageByEvent(e);
    })
  }


  get call(){
    return window['currentCall'];
  }

  get roomId(){
    return this.conversation && this.conversation.uuid;
  }


  create(){
    this.logging('create new conversation');
    const title = '';
    this.messenger.createConversation([], title, false, true)
        //CreateConversationEvent
        .then( e => {
          this.conversation = e.conversation;

          this.isOwner = true;
          const message = `{"event":"set_room_id","roomId":"${this.roomId}"}`;
          this.call.sendMessage(message);
          this.logging(`send message:${message}`);
        })
        .catch(reason => {
          this.error('Fail join to conversation', reason);
        });
  }

  join(roomId){
    if (this.roomId){
      this.logging(`already joined to exist conversation roodId${this.roomId}. Skip join to:${roomId}`);
      return;
    }
    this.logging('join to exist conversation', roomId);
    this.messenger.getConversation(roomId)
        //https://voximplant.com/docs/references/websdk/voximplant/messaging/eventhandlers/editconversationevent
        .then(e=>{
          this.logging('Success! joined to exist conversation');
          this.conversation = e.conversation;
          this.getLastMessages();
          //this.sendMessage('ping');
        })
        .catch(reason => {
          this.error('Fail join to conversation', reason);
        })
  }

  getLastMessages(){
    if(this.conversation){
      let first = 1;
      let last = this.conversation.lastSeq;
      if(this.conversation.lastSeq>99){
        first = this.conversation.lastSeq - 99;
      }
      this.conversation.retransmitEvents(first,last)
        // RetransmitEventsEvent
        .then(ev=>{
          //RetransmittedEvent[]
           ev.events
               //RetransmittedEvent
               .forEach(event=>this.addMessageByEvent(event))
        })
          .catch(e=>{
            this.warn(" retransmitEvents fail", JSON.stringify(e));
          })
      ;
    } else {
      this.warn('Trying to get last messages from non-existing conversation')
    }
  }
  connectionId;
  setConnectionId(connectionId){
    this.connectionId = connectionId;
  }
  setDisplayName(name){
    this.displayName = name;
  }

  messages = [];
  /**
   * RetransmittedEvent
   * @param event
   */
  addMessageByEvent(event){
    if(event.message) {
      this.messages.push(event.message);
      this.addChatMessage(event.message);
    }
  }
  // handler to CallInterface
  addChatMessage=()=>{}


  /**
   * От кого именно это сообщение - будем хранить вот тут
   * (https://voximplant.com/docs/references/websdk/voximplant/messaging/message#conversation) в формате
   * {displayName:'DISPLAY_NAME', connectionId:'CONNECTION_ID'}  CONNECTION_ID нужно брать тот же, что и отправляется в заголовке 'X-UUID' в callConference
   * @param text
   */
  sendMessage = (text) =>{
    this.conversation.sendMessage(text,[{displayName:this.displayName, connectionId:this.connectionId, time:Date.now()}])
  }


}

const ChatManager = new ChatManagerClass();

export { ChatManager };
