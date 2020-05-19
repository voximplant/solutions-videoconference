import { currentUser } from './classes/User.js';
import { LayerManager } from './classes/LayerManager.js';
import { getSettings, updateUserStatus } from './settingsForm.js';
import CallManager from './classes/CallManager.js';
import { VIManager } from './classes/VIManager.js';
import { SDKService } from './classes/SDKService.js';
import Env from './classes/Env.js';

const layerManager = LayerManager;
const user = currentUser;

const startButton = document.querySelector('.js__start-btn');
const callForm = document.querySelector('.js__call-form');
const errorMessage = document.querySelector('.js__error-notify');

const settingsCameraFlag = document.querySelector('.js__settings-camera-flag');
const settingsMicrophoneFlag = document.querySelector('.js__settings-microphone-flag');
const settingsVideoContainer = document.querySelector('.conf__form-video');
const settingsForm = document.querySelector('.js__settings-form');

const inviteInput = document.getElementById('roomId');
const inviteCopyLink = document.querySelector('.js__copy-link');
let localVideoElement;

/**
 * Invite
 */
const onFirstClick = async function (e) {
  if (e && e.preventDefault) {
    e.preventDefault();
    this.disabled = true;
    this.classList.add('loading');
  }

  SDKService.login();

  if (user.isConfOwner) {
    user.serviceId = `${Math.floor(Math.random() * 99999999) + 1000000}`;
    window.history.replaceState({}, '', Env.replaceHistoryPrefix + user.serviceId);
  }
  callForm.querySelector('#service_id').value = user.serviceId;
  const userDataFromLocalStorage = user.getLocalStorage();
  if (userDataFromLocalStorage) {
    callForm.querySelector('#customer_name').value = userDataFromLocalStorage.name;
    callForm.querySelector('#customer_email').value = userDataFromLocalStorage.email;
    if (userDataFromLocalStorage.uuid) user.uuid = userDataFromLocalStorage.uuid;
  }
};
document.addEventListener('DOMContentLoaded', () => {
  if (!currentUser.isConfOwner) {
    onFirstClick();
  } else {
    document.querySelector('.conf__welcome').style.display = 'flex';
  }
});

startButton.addEventListener('click', onFirstClick);

/**
 * Check Camera
 */

callForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  user.serviceId = formData.get('serviceId');
  user.name = formData.get('userName');
  user.email = formData.get('userEmail');
  window.initReporter('Videoconf', '', '');
  user.setLocalStorage();

  console.warn('New User:', user);

  if (VIManager.checkBrowser()) {
    console.warn('[WebSDk] RTC SUPPORTED');
    layerManager.show('conf__access-allow');
  } else {
    layerManager.show('conf__access-not-supported');
    errorMessage.appendChild(document.createTextNode('Browser not supported'));
    console.warn('[WebSDk] RTC NOT SUPPORTED!');
    return;
  }

  VIManager.getLocalMedia()
    .then((e) => {
      layerManager.show('conf__settings');
      if (e.permissions.video) {
        localVideoElement = document.createElement('video');
        localVideoElement.setAttribute('muted', 'muted');
        localVideoElement.setAttribute('playsinline', 'true');
        localVideoElement.setAttribute('autoplay', 'true');
        localVideoElement.srcObject = new MediaStream(e.stream.getVideoTracks());
        settingsVideoContainer.appendChild(localVideoElement);
        localVideoElement.play().catch(console.error);
      } else {
        settingsMicrophoneFlag.classList.add('option--off');
        user.cameraStatus = -1;
      }
      getSettings(localVideoElement);
    })
    .catch(() => {
      layerManager.show('conf__no-access');
    });
});

/**
 * Settings
 */
const settingsFormListener = (e) => {
  e.preventDefault();
  settingsForm.removeEventListener('submit', settingsFormListener);
  VIManager.stopLocalMedia();
  VIManager.setSettings();
  new CallManager(currentUser.getCallSettings());
  inviteInput.value = `${Env.url}${Env.replaceHistoryPrefix}${user.serviceId}`;
  console.warn(`[WebSDk] Call crete from serviceID: conf_${user.serviceId}`);
};

settingsForm.addEventListener('submit', settingsFormListener);

settingsCameraFlag.addEventListener('click', () => {
  if (user.cameraStatus === -1) return;
  VIManager.enableLocalCam(!user.cameraStatus)
    .then((e) => {
      user.cameraStatus = user.cameraStatus ? 0 : 1;
      settingsCameraFlag.classList.toggle('option--off');
      localVideoElement.srcObject = e;
      localVideoElement.play();
      updateUserStatus();
    })
    .catch(() => {
      console.warn("Can't change the camera state");
    });
});

settingsMicrophoneFlag.addEventListener('click', () => {
  settingsMicrophoneFlag.classList.toggle('option--off');
  user.microphoneEnabled = !user.microphoneEnabled;
  VIManager.enableLocalMic(user.microphoneEnabled);
  updateUserStatus();
});

inviteCopyLink.onclick = () => {
  inviteInput.select();
  document.execCommand('copy');
  setTimeout(() => {
    inviteInput.blur();
  }, 100);
};
