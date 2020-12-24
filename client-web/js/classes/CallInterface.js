'use strict';

import {WSService} from './WSService.js';
import CallManager from './CallManager.js';
import {currentUser} from './User.js';
import {LayerManager} from './LayerManager.js';
import {showLeaveForm} from '../leaveForm.js';
import {unregisterCallback} from './HotkeyManager.js';

export default class CallInterface {
  constructor() {
    this.cam = document.querySelector('.js__cam');
    this.mic = document.querySelector('.js__mic');
    this.share = document.querySelector('.js__share');
    this.share.parentElement.style.display = 'none';
    this.chat = document.querySelector('.js__chat');
    this.leave = document.querySelector('.js__leave');
    this.sidebar = document.querySelector('.js__sidebar');
    this.toggleButtonChat = document.querySelector('.button_toggle_left');
    this.toggleButtonPeople = document.querySelector('.button_toggle_right');
    this.sidebarContainer = document.querySelector('.conf__sidebar-container');

    this.messageSound = document.querySelector('.js__message_sound');
    this.messageList = document.querySelector('.conf__sidebar-chat-message-list');
    this.messageInput = document.querySelector('.conf__sidebar-chat-message-input');
    this.messageSendButton = document.querySelector('.conf__sidebar-chat-message-sendButton');

    this.addEventListeners();
    this.sdk = window.VoxImplant.getInstance();
    VoxImplant.getInstance()
      .screenSharingSupported()
      .then((result) => {
        if (result) this.share.parentElement.style.display = 'flex';
      });
  }

  addEventListeners() {
    this.cam.addEventListener('click', () => {
      this.cameraToggle();
    });
    this.mic.addEventListener('click', () => {
      this.muteToggle();
    });
    this.share.addEventListener('click', () => {
      this.shareToggle();
    });
    this.chat.addEventListener('click', (e) => {
      this.toggleStatus(e);
      this.sidebar.classList.toggle('sidebar--close');
    });
    this.leave.addEventListener('click', () => {
      this.leaveRoom();
    });

    this.toggleButtonChat.addEventListener('click', () => {
      this.toggleButtonChat.classList.toggle('button_toggle_active');
      this.toggleButtonPeople.classList.toggle('button_toggle_active');
      this.toggleButtonChat.classList.toggle('button_toggle_inactive');
      this.toggleButtonPeople.classList.toggle('button_toggle_inactive');
      this.sidebarContainer.classList.toggle('conf__sidebar-chat');
      this.sidebarContainer.classList.toggle('conf__sidebar-people');
    });
    this.toggleButtonPeople.addEventListener('click', () => {
      this.toggleButtonChat.classList.toggle('button_toggle_active');
      this.toggleButtonPeople.classList.toggle('button_toggle_active');
      this.toggleButtonChat.classList.toggle('button_toggle_inactive');
      this.toggleButtonPeople.classList.toggle('button_toggle_inactive');
      this.sidebarContainer.classList.toggle('conf__sidebar-chat');
      this.sidebarContainer.classList.toggle('conf__sidebar-people');
    });

    this.messageSendButton.addEventListener('click', () => {
      this.addNewMessage();
    })

    this.messageInput.addEventListener('keypress',ev=>{
      if(ev.code==='Enter')
        this.addNewMessage();
    })


    document.querySelector('.js__close-sidebar').addEventListener('click', () => {
      this.sidebar.classList.toggle('sidebar--close');
      this.chat.classList.toggle('option--off');
    });

    WSService.addEventListener('mute', (e) => {
      this.onMuteToggle(e);
    });
    WSService.addEventListener('vad', (e) => {
      this.displayVad(e);
    });
  }


  addNewMessageCallback=()=>{};

  registerMessageHandlers(addNewMessageCallback, addChatMessage  ){
    this.addNewMessageCallback = addNewMessageCallback;
   // addChatMessage = this.addChatMessage;
  }

  addNewMessage(){
    if (this.messageInput.value) {
      const text = ""+this.messageInput.value;
      this.addNewMessageCallback(text);
      this.messageInput.value = "";
    }
  }

  renderChatTemplate(message) {
    let className = 'chat_message_other';
    const payload = message.payload[0];
    if (currentUser.name === payload.displayName ){
      className = 'chat_message_mine'
    } else {
      this.messageSound.play()
    }

    const template = document.importNode(document.getElementById('js_chat_message').content, true);
    template.querySelector('.chat_message').id = message.uuid;
    template.querySelector('.chat_message').classList.add(className)
    template.querySelector('.message_name').textContent = payload.displayName;
    template.querySelector('.message_text').textContent = message.text;
    template.querySelector('.message_text').innerHTML = this.processAnchorMe(template.querySelector('.message_text').textContent);

    const time = new Date(payload.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    template.querySelector('.message_time').textContent = time;
    //template.querySelector('.message_info').textContent = JSON.stringify(message);
    return template;
  }
  //detect links / URLs / Emails in text and convert them to clickable HTML anchor links.
  processAnchorMe(input) {
    return anchorme({
      input,
      // use some options
      options: {
        // any link that has with "google.com/search?"
        // will be truncated to 40 characters,
        // github links will not be truncated
        // other links will truncated to 10 characters
        truncate: 40,
        // characters will be taken out of the middle
        middleTruncation: true,
        attributes: {
          target: "_blank"
        },
      },
    });
  }

  //TODO update message
  addChatMessage=(message)=>{
    let li = document.createElement('li');
    li.appendChild(this.renderChatTemplate(message));
    this.messageList.appendChild(li);
  }

  toggleStatus(e) {
    e.target.classList.toggle('option--off');
  }

  shareToggle() {
    if (this.share.classList.contains('option--off')) {
      CallManager.reporter.stopSharingScreen();
      CallManager.currentConf
        .stopSharingScreen()
        .then(() => {
          // if video stub active
          if (currentUser.cameraStatus === 0) {
            LayerManager.toggleVideoStub('localVideoNode', true);
          }

          WSService.notifySharing(false);
          this.share.classList.toggle('option--off');
          document.getElementById('localVideoNode').classList.toggle('is--sharing');
        })
        .catch((e) => {
          console.error(`[WebSDk] Cannot stop sharing: ${e.message}`);
        });
    } else {
      // if video stub active
      setTimeout(() => {
        if (currentUser.cameraStatus === 0) {
          LayerManager.toggleVideoStub('localVideoNode', false);
        }
      }, 1000);

      CallManager.reporter.shareScreen(true, true);
      CallManager.currentConf
        .shareScreen(true, true)
        .then(() => {
          WSService.notifySharing(true);
          this.share.classList.toggle('option--off');
          document.getElementById('localVideoNode').classList.toggle('is--sharing');

          let renderer = window.VoxImplant.Hardware.StreamManager.get().getLocalMediaRenderers()[0];
          if (renderer.kind === 'sharing') {
            renderer.stream.getTracks().forEach((tr) => {
              tr.addEventListener('ended', () => {
                WSService.notifySharing(false);
                document.getElementById('localVideoNode').classList.toggle('is--sharing');
                this.share.classList.toggle('option--off');
                // if video stub active
                if (currentUser.cameraStatus === 0) {
                  LayerManager.toggleVideoStub('localVideoNode', true);
                }
              });
            });
          }
        })
        .catch((e) => {
          console.error(`[WebSDk] Sharing failed: ${e.message}`);
          if (currentUser.cameraStatus === 0) {
            LayerManager.toggleVideoStub('localVideoNode', true);
          }
        });
    }
  }

  onSharingToggle(e) {
    if (currentUser.cameraStatus === 0) {
      console.log('sharing', e);
      LayerManager.toggleVideoStub(e.endpointId, !e.value);
    }
  }

  muteToggle(_, isMute) {
    let localVideo = document.getElementById('localVideoNode');
    let muteLocalLabel = localVideo.querySelector('.conf__video-wrap .conf__video-micro');

    let mute = isMute ? isMute === 'mute' : currentUser.microphoneEnabled;

    if (!mute) {
      CallManager.currentConf.unmuteMicrophone();
      WSService.notifyMute(false);
      muteLocalLabel.classList.add('hidden');
      currentUser.microphoneEnabled = true;
      this.mic.classList.remove('option--off');
    } else {
      CallManager.currentConf.muteMicrophone();
      WSService.notifyMute(true);
      muteLocalLabel.classList.remove('hidden');
      currentUser.microphoneEnabled = false;
      this.mic.classList.add('option--off');
    }
  }

  displayVad(e) {
    let endpoint = document.getElementById(e.endpointId).querySelector('video');
    if (e.value) {
      // box-shadow color
      endpoint.style.color = 'rgba(0,220,125, 1)';
    } else {
      //box-shadow color
      endpoint.style.color = 'rgba(0,220,125, 0)';
    }
  }

  onMuteToggle(e) {
    let video = document.getElementById(e.endpointId);
    let muteLabel = video.querySelector('.conf__video-wrap .conf__video-micro');

    if (e.value) {
      muteLabel.classList.remove('hidden');
    } else {
      muteLabel.classList.add('hidden');
    }
  }

  cameraToggle(_, isVideo) {
    let showVideo = isVideo ? isVideo === 'show' : currentUser.cameraStatus === 0;
    if (showVideo) {
      CallManager.reporter.sendVideo();
      CallManager.currentConf.sendVideo(true);
      if (!document.getElementById('voximplantlocalvideo')) this.sdk.showLocalVideo(true);
      currentUser.cameraStatus = 1;
      LayerManager.toggleVideoStub('localVideoNode', false);
      WSService.notifyVideo(true);
      this.cam.classList.remove('option--off');
    } else {
      CallManager.reporter.stopSendVideo();
      CallManager.currentConf.sendVideo(false);
      if (document.getElementById('voximplantlocalvideo')) this.sdk.showLocalVideo(false);
      currentUser.cameraStatus = 0;
      WSService.notifyVideo(false);
      LayerManager.toggleVideoStub('localVideoNode', true);
      this.cam.classList.add('option--off');
    }
  }

  displayVideoStub(e) {
    LayerManager.toggleVideoStub(e.endpointId, !e.value);
  }

  leaveRoom() {
    console.warn('Leave Room');
    unregisterCallback();
    window.VoxImplant.getInstance().showLocalVideo(false);
    CallManager.disconnect();
    showLeaveForm();
  }
  attribute={};
  toggleFullScreen(participantId) {
    const participantFrame = document.getElementById(participantId);
    const confFooter = document.querySelector('.conf__info-footer');
    if (!participantFrame) return;
    if (screenfull.isFullscreen) {
      screenfull.exit().then(() => {
        this.moveControlsFromFullScreen();
        participantFrame.setAttribute('style', this.attribute);
      });
    } else {
      this.attribute = participantFrame.getAttribute('style');
      screenfull.request(participantFrame).then(() => {
        participantFrame.removeAttribute('style');
        participantFrame.appendChild(confFooter);
        confFooter.classList.add('conf__info-footer--fullscreen');
      });
    }
  }

  checkFullScreen(participantId) {
    if (document.fullscreenElement && document.fullscreenElement.id === participantId)
      document.exitFullscreen().then(() => {
        this.moveControlsFromFullScreen();
      });
  }

  moveControlsFromFullScreen() {
    const confFooter = document.querySelector('.conf__info-footer');
    document.querySelector('.conf__video-section-wrapper').appendChild(confFooter);
    confFooter.classList.remove('conf__info-footer--fullscreen');
  }
}
