'use strict';

import { WSService } from './WSService.js';
import CallManager from './CallManager.js';
import { currentUser } from './User.js';
import { LayerManager } from './LayerManager.js';
import { showLeaveForm } from '../leaveForm.js';
import { unregisterCallback } from './HotkeyManager.js';

export default class CallInterface {
  constructor() {
    this.cam = document.querySelector('.js__cam');
    this.mic = document.querySelector('.js__mic');
    this.share = document.querySelector('.js__share');
    this.share.parentElement.style.display = 'none';
    this.chat = document.querySelector('.js__chat');
    this.leave = document.querySelector('.js__leave');
    this.sidebar = document.querySelector('.js__sidebar');
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

  toggleFullScreen(participantId) {
    const participantFrame = document.getElementById(participantId);
    const confFooter = document.querySelector('.conf__info-footer');
    if (!participantFrame) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        this.moveControlsFromFullScreen();
      });
    } else {
      participantFrame.requestFullscreen().then(() => {
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
