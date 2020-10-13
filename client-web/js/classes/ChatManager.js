import {AbstractLogging} from "./AbstractLogging.js";

class ChatManagerClass extends AbstractLogging{
  constructor() {
    super("ChatManagerClass");
    this._messenger;
    this.roomId = '';
    this.isOwner = false;
  }
 // we need it after authorized
  get messenger(){
    if(!this._messenger) {
      this._messenger= window.VoxImplant.getMessenger();
    }
    return this._messenger;
  }

  get call(){
    return window['currentCall'];
  }



  create(){
    this.logging('create new conversation');
    const title = '';
    this.messenger.createConversation([], title, false)
        //CreateConversationEvent
        .then( e => {
          this.roomId = e.conversation.uuid;
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
    this.roomId = roomId;
    if(this.isOwner){
      this.logging('already joined to exist conversation', this.roomId);
      return;
    }
    this.logging('join to exist conversation', this.roomId);
    this.messenger.joinConversation(this.roomId)
        //https://voximplant.com/docs/references/websdk/voximplant/messaging/eventhandlers/editconversationevent
        .then(e=>{
          this.logging('Success! joined to exist conversation');
        })
        .catch(reason => {
          this.error('Fail join to conversation', reason);
        })
  }
}

const ChatManager = new ChatManagerClass();

export { ChatManager };
