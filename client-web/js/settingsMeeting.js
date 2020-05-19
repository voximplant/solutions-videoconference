import { VIManager } from './classes/VIManager.js';
import CallManager from './classes/CallManager.js';

let settingsForm = document.querySelector('.conf__settings');
let setupOpen = document.querySelector('.settings-setup-open');
let setupClose = document.querySelector('.conf__settings-setup-close');
let localVideoElement;

const onPopupEscPress = function (evt) {
  if (evt.key === 'Escape') {
    closePopup();
  }
};
const onSavePopup = function (e) {
  e.preventDefault();
  VIManager.setCallSettings(CallManager.currentConf);
  closePopup();
};
const openPopup = function () {
  settingsForm.classList.add('conf__settings--popup');
  document.addEventListener('keydown', onPopupEscPress);
  document.querySelector('.js__settings-camera-flag').style.display = 'none';
  document.querySelector('.js__settings-microphone-flag').style.display = 'none';
  settingsForm.querySelector('.conf__form-title span').innerHTML = 'Settings';
  VIManager.getLocalMedia().then((e) => {
    if (e.permissions.video) {
      localVideoElement = document.querySelector('.conf__form-video video');
      localVideoElement.srcObject = new MediaStream(e.stream.getVideoTracks());
    } else {
    }
  });
  settingsForm.addEventListener('submit', onSavePopup);
};

const closePopup = function () {
  VIManager.stopLocalMedia();
  settingsForm.classList.remove('conf__settings--popup');
  document.removeEventListener('keydown', onPopupEscPress);
  settingsForm.removeEventListener('submit', onSavePopup);
};
setupOpen.addEventListener('click', function () {
  openPopup();
});
setupOpen.addEventListener('keydown', function (evt) {
  if (evt.key === 'Enter') {
    openPopup();
  }
});
setupClose.addEventListener('click', () => {
  closePopup();
});
setupClose.addEventListener('keydown', function (evt) {
  if (evt.key === 'Enter') {
    closePopup();
  }
});
