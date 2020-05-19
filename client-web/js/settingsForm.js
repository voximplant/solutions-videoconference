import { VIManager } from './classes/VIManager.js';
let localVideoElement;
export const getSettings = (localVideo) => {
  localVideoElement = localVideo;
  getCameraSettings();
  getMicrophoneSettings();
  getSpeakersSettings();
  updateUserStatus();
};

function getCameraSettings() {
  window.VoxImplant.Hardware.CameraManager.get()
    .getInputDevices()
    .then((devices) => {
      const select = document.getElementById('cameraSettings');
      const selectCamera = document.getElementById('selectCamera');
      const selectCameraButton = document.getElementById('cameraSettingsButton');
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
      const deleteSelect = (name) => {
        selectCameraButton.textContent = name;
        select.style.display = 'none';
        selectCameraButton.style.background = '#fff';
        selectCamera.onclick = () => {};
      };
      if (devices.length === 0) {
        deleteSelect('No available camera');
      } else if (devices.length === 1) {
        deleteSelect(devices[0].name);
      } else {
        const currentCameraLabel = VIManager.getCameraName();
        const sortedDevices = [
          devices.find((cam) => ~cam.name.indexOf(currentCameraLabel)),
          ...devices.filter((cam) => !~cam.name.indexOf(currentCameraLabel)),
        ];
        sortedDevices.forEach((device) => {
          if (~device.name.indexOf(currentCameraLabel)) {
            selectCameraButton.textContent = device.name;
          }
          const option = document.createElement('li');
          option.onclick = () => {
            changeCamera(device.id);
          };
          option.appendChild(document.createTextNode(`${device.name}`));
          option.value = device.name + '';
          select.appendChild(option);
        });
      }
    });
}

function getMicrophoneSettings() {
  window.VoxImplant.Hardware.AudioDeviceManager.get()
    .getInputDevices()
    .then((devices) => {
      const select = document.getElementById('microphoneSettings');
      const selectMic = document.querySelector('.conf__form-row_camera');
      const selectMicButton = document.getElementById('microphoneSettingsButton');
      // const micDevices = devices.filter(mic => !~mic.id.indexOf('communications'));
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
      const deleteSelect = (name) => {
        selectMicButton.textContent = name;
        select.style.display = 'none';
        selectMicButton.style.background = '#fff';
        selectMic.onclick = () => {};
      };
      if (devices.length === 0) {
        deleteSelect('No available microphone');
      } else if (devices.length === 1) {
        deleteSelect(devices[0].name);
      } else {
        const currentMicLabel = VIManager.getMicName();
        selectMicButton.textContent = currentMicLabel;
        devices.forEach((device) => {
          // if (~device.name.indexOf(currentMicLabel)) {
          //   selectMicButton.textContent = devices.slice(device.indexOf('('));
          // }
          const option = document.createElement('li');
          option.onclick = () => {
            changeMicrophone(device.id);
          };
          option.appendChild(document.createTextNode(`${device.name}`));
          option.value = `${device.name}`;
          select.appendChild(option);
        });
      }
    });
}

function getSpeakersSettings() {
  window.VoxImplant.Hardware.AudioDeviceManager.get()
    .getOutputDevices()
    .then((devices) => {
      const select = document.getElementById('speakersSettings');
      const selectSpeakersButton = document.getElementById('speakersSettingsButton');
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
      if (devices.length < 2) {
        selectSpeakersButton.parentElement.parentElement.style.display = 'none';
        return;
      }

      devices.forEach((device) => {
        selectSpeakersButton.textContent = device.name;
        const option = document.createElement('li');
        option.onclick = () => {
          changeSpeakers(device.id);
        };
        option.appendChild(document.createTextNode(`${device.name}`));
        option.value = `${device.name}`;
        select.appendChild(option);
      });
    });
}

export function updateUserStatus() {}

function changeCamera(cameraId) {
  VIManager.changeLocalCam(cameraId)
    .then((e) => {
      localVideoElement.srcObject = e;
      localVideoElement.play();
    })
    .catch((e) => {
      setTimeout(changeCamera(), 0);
    });
}

function changeMicrophone(newMic) {
  VIManager.changeLocalMic(newMic)
    .then((e) => {})
    .catch((e) => {
      setTimeout(changeMicrophone(), 0);
    });
}

function changeSpeakers(newSpeaker) {
  VIManager.changeLocalSpeakers(newSpeaker);
}
