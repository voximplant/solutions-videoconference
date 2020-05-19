'use strict';

import { WSService } from './WSService.js';
import { calculateVideoGrid, setVideoSectionWidth } from '../video.js';
import CallInterface from './CallInterface.js';
import { currentUser } from './User.js';
import { LayerManager } from './LayerManager.js';
import { SDKService } from './SDKService.js';
import { registerCallbacks } from './HotkeyManager.js';

const container = document.getElementById('js__workbench');
const inviteForm = document.querySelector('.js__invite-form');
const settingsApplyButton = document.querySelector('.js__settings-apply-button');
const errorMessage = document.querySelector('.js__error-notify');

export default class CallManager {
  constructor(newCallParams) {
    CallManager.endPointsSet = {};
    settingsApplyButton.disabled = true;
    settingsApplyButton.classList.add('loading');
    CallManager.currentConf = window.VoxImplant.getInstance().callConference(newCallParams);
    CallManager.reporter = callReporter(
      CallManager.currentConf,
      currentUser.name,
      currentUser.serviceId,
      currentUser.uuid
    );
    window['currentCall'] = CallManager.currentConf;
    this.bindCallCallbacks();
    this.callInterface = new CallInterface();
    this.soundAdded = document.getElementById('js__ep_added_sound');
    this.soundAdded.volume = 0.5;
    this.soundRemoved = document.getElementById('js__ep_removed_sound');
    this.soundRemoved.volume = 0.5;
    registerCallbacks(this.callInterface);
  }

  static disconnect() {
    CallManager.currentConf.off(window.VoxImplant.CallEvents.Connected);
    CallManager.currentConf.off(window.VoxImplant.CallEvents.Disconnected);
    CallManager.currentConf.off(window.VoxImplant.CallEvents.Failed);
    CallManager.currentConf.off(window.VoxImplant.CallEvents.EndpointAdded);
    CallManager.currentConf.hangup();
  }

  bindCallCallbacks() {
    console.warn(`[WebSDk] Setup listeners for ID: ${CallManager.currentConf.id()}`);
    CallManager.currentConf.on(window.VoxImplant.CallEvents.Connected, (e) =>
      this.onCallConnected(e)
    );
    CallManager.currentConf.on(window.VoxImplant.CallEvents.Disconnected, (e) =>
      this.onCallDisconnected(e)
    );
    CallManager.currentConf.on(window.VoxImplant.CallEvents.Failed, (e) => this.onCallFailed(e));
    CallManager.currentConf.on(window.VoxImplant.CallEvents.EndpointAdded, (e) =>
      this.onEndpointAdded(e)
    );
  }

  onCallConnected(e) {
    /** Bug fix for FireFox */
    CallManager.endPointsSet[`${currentUser.uuid}`] = {
      displayName: currentUser.name,
      id: currentUser.uuid,
      isDefault: true,
    };

    inviteForm.classList.remove('hidden', 'popup-view');

    let localVideo = document.getElementById('localVideoNode');
    let nameLocalLabel = localVideo.querySelector('.conf__video-wrap .conf__video-name');
    nameLocalLabel.innerHTML = `${currentUser.name} (you)`;

    if (currentUser.cameraStatus !== 1) {
      this.callInterface.cameraToggle('', 'hide');
    }

    if (!currentUser.microphoneEnabled) {
      this.callInterface.muteToggle('', 'mute');
    }
    /** end */
    console.warn(`[WebSDk] Call connected ID: ${e.call.id()}`);
    WSService.login(
      e.headers['X-Conf-Sess'],
      e.headers['X-Conf-Call'],
      !currentUser.microphoneEnabled,
      false,
      currentUser.cameraStatus === 1 ? true : false
    );
    if (CallManager.currentConf.settings.video.sendVideo) {
      window.VoxImplant.getInstance().showLocalVideo(true);
    }

    settingsApplyButton.disabled = false;
    settingsApplyButton.classList.remove('loading');
    calculateVideoGrid();
    LayerManager.show('conf__video-section-wrapper');
  }

  onCallDisconnected(e) {
    if (e.headers['X-Multiple-Login']) {
      LayerManager.show('conf__error');
      errorMessage.appendChild(
        document.createTextNode(
          'You have connected to the conference in another browser tab or window.'
        )
      );
      window.VoxImplant.getInstance().showLocalVideo(false);
    } else {
      console.warn(`[WebSDk] Call ended ID: ${e.call.id()}`);
      SDKService.reconnect();
    }
  }

  onCallFailed(e) {
    console.warn(`[WebSDk] Call failed ID: ${e.call.id()}`);
    SDKService.reconnect();
  }

  calculateParticipants() {
    const sidebar = document.querySelector('.conf__sidebar-participants-list');
    while (sidebar.firstChild) {
      sidebar.removeChild(sidebar.firstChild);
    }
    const template = document.getElementById('js__endpoint-list-template');
    template.content.querySelector(
      '.conf__sidebar-participant-title'
    ).textContent = `${currentUser.name} (you)`;
    const node = document.importNode(template.content, true);
    node.id = 'js__local_participant_enlist';
    sidebar.appendChild(node);
    if (CallManager.currentConf) {
      CallManager.currentConf.getEndpoints().forEach((endpoint) => {
        if (!endpoint.isDefault) {
          const template = document.getElementById('js__endpoint-list-template');
          template.content.querySelector(
            '.conf__sidebar-participant-title'
          ).textContent = `${endpoint.displayName}`;
          const node = document.importNode(template.content, true);
          node.id = 'list_' + endpoint.id;
          sidebar.appendChild(node);
        }
      });
    }
  }

  toggleEndpointListVideo(endpointId, video, sharing) {}

  toggleEndpointListAudio(endpointId, audio) {}

  onEndpointAdded(e) {
    if (!CallManager.endPointsSet[`${e.endpoint.id}`]) {
      e.endpoint.on(window.VoxImplant.EndpointEvents.Removed, (e) => this.onEndpointRemoved(e));
      e.endpoint.on(window.VoxImplant.EndpointEvents.RemoteMediaAdded, (e) =>
        this.onRemoteMediaAdded(e)
      );
      e.endpoint.on(window.VoxImplant.EndpointEvents.RemoteMediaRemoved, (e) =>
        this.onRemoteMediaRemoved(e)
      );

      // all actions with endpoint only inside this
      console.warn(
        `[WebSDk] New endpoint ID: ${e.endpoint.id} (${
          e.endpoint.isDefault ? 'default' : 'regular'
        })`
      );
      if (e.endpoint.isDefault) {
        CallManager.endPointsSet = {};
      }
      CallManager.endPointsSet[`${e.endpoint.id}`] = e.endpoint;

      if (e.endpoint.isDefault) {
        let localVideo = document.getElementById('localVideoNode');
        let nameLocalLabel = localVideo.querySelector('.conf__video-wrap .conf__video-name');
        nameLocalLabel.innerHTML = `${currentUser.name} (you)`;

        if (currentUser.cameraStatus !== 1) {
          this.callInterface.cameraToggle('', 'hide');
        }

        if (!currentUser.microphoneEnabled) {
          this.callInterface.muteToggle('', 'mute');
        }
      } else {
        const node = LayerManager.renderTemplate(
          e.endpoint.id,
          e.endpoint.displayName,
          1 + e.endpoint.place
        );

        container.appendChild(node);
        this.soundAdded.play();
        console.warn(e.endpoint);
        console.error(e.endpoint.place);
        // document.getElementById(e.endpoint.id).style.order = e.endpoint.place;
        const fullscreen = document
          .getElementById(e.endpoint.id)
          .querySelector('.conf__video-fullscreen');
        if (fullscreen) {
          if (!document.fullscreenEnabled) {
            fullscreen.style.display = 'none';
          } else {
            fullscreen.addEventListener('click', (event) => {
              this.callInterface.toggleFullScreen(e.endpoint.id);
            });
          }
        }
        e.endpoint.mediaRenderers.forEach((mr) => {
          this.onRemoteMediaAdded({ endpoint: e.endpoint, mediaRenderer: mr });
        });
      }

      if (Object.keys(CallManager.endPointsSet).length < 2) {
        inviteForm.classList.remove('hidden', 'popup-view');
      } else {
        inviteForm.classList.add('hidden', 'popup-view');
      }

      this.calculateParticipants();
      setVideoSectionWidth();
    }
  }

  onRemoteMediaAdded(e) {
    console.warn(`[WebSDk] New MediaRenderer in ${e.endpoint.id}`, e);
    if (CallManager.endPointsSet[`${e.endpoint.id}`] && !e.endpoint.isDefault) {
      const endpointNode = document.getElementById(e.endpoint.id);

      if (
        e.mediaRenderer.kind === 'video' &&
        document.getElementById(`videoStub-${e.endpoint.id}`)
      ) {
        LayerManager.toggleVideoStub(e.endpoint.id, false);
      }

      if (e.mediaRenderer.kind === 'sharing') {
        LayerManager.toggleVideoStub(e.endpoint.id, false);
      }

      e.mediaRenderer.render(endpointNode);
      e.mediaRenderer.placed = true;

      if (
        !e.endpoint.mediaRenderers.find(
          (renderer) => renderer.kind === 'video' || renderer.kind === 'sharing'
        )
      ) {
        LayerManager.toggleVideoStub(e.endpoint.id, true);
      }
    }
  }

  onRemoteMediaRemoved(e) {
    console.warn(`[WebSDk] MediaRenderer removed from ${e.endpoint.id}`, e);
    if (CallManager.endPointsSet[`${e.endpoint.id}`] && !e.endpoint.isDefault) {
      if (
        !e.endpoint.mediaRenderers.find(
          (renderer) => renderer.kind === 'video' || renderer.kind === 'sharing'
        )
      ) {
        LayerManager.toggleVideoStub(e.endpoint.id, true);
      }
    }
  }

  onEndpointRemoved(e) {
    this.soundRemoved.play();
    this.callInterface.checkFullScreen(e.endpoint.id);
    console.warn(`[WebSDk] Endpoint was removed ID: ${e.endpoint.id}`);
    const node = document.getElementById(e.endpoint.id);
    if (node) {
      container.removeChild(node);
    }

    delete CallManager.endPointsSet[`${e.endpoint.id}`];

    if (Object.keys(CallManager.endPointsSet).length < 2) {
      inviteForm.classList.remove('hidden', 'popup-view');
      setVideoSectionWidth();
    }

    if (Object.keys(CallManager.endPointsSet).length > 0) {
      setTimeout(() => {
        this.calculateParticipants();
        setVideoSectionWidth();
      }, 0);
    }
  }
}
