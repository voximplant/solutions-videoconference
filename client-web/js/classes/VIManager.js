import Env from './Env.js';

let localStream = null;
let cameraId = null;
let micId = null;
let speakerId = null;
let micNode;
let audioContext;
let audioLevelNode;

function refreshCamera() {
  return new Promise((resolve, reject) => {
    let constraints = {
      audio: false,
      video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: 25 },
    };
    if (cameraId) constraints.video.deviceId = { exact: cameraId };
    else constraints.video.facingMode = 'user';
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        localStream = new MediaStream([
          ...localStream.getAudioTracks(),
          ...stream.getVideoTracks(),
        ]);
        resolve(stream);
      })
      .catch(reject);
  });
}

function generateConstraints() {
  const videoSettings = {
    frameWidth: 640,
    frameHeight: 360,
    frameRate: 25,
  };
  if (cameraId) {
    videoSettings.cameraId = cameraId;
  } else {
    videoSettings.facingMode = true;
  }
  const audioSettings = {
    echoCancellation: true,
    autoGainControl: true,
    noiseSuppression: true,
    advanced: [
      { googEchoCancellation: { exact: true } },
      { googExperimentalEchoCancellation: { exact: true } },
      { autoGainControl: { exact: true } },
      { noiseSuppression: { exact: true } },
      { googHighpassFilter: { exact: true } },
      { googAudioMirroring: { exact: true } },
    ],
  };
  if (micId) {
    audioSettings.inputId = micId;
  }
  if (speakerId) {
    audioSettings.outputId = speakerId;
  }
  return { videoSettings, audioSettings };
}

function getStoredCameraAndMic() {
  const mediaSettings = localStorage.getItem('mediaSettings');
  if (mediaSettings) {
    try {
      const store = JSON.parse(mediaSettings);
      if (store.micId) micId = store.micId;
      if (store.cameraId) cameraId = store.cameraId;
      if (store.speakerId) speakerId = store.speakerId;
    } catch (e) {}
  }
}

function setStoredCameraAndMic() {
  const store = {};
  if (micId) store.micId = micId;
  if (cameraId) store.cameraId = cameraId;
  if (speakerId) store.speakerId = speakerId;
  localStorage.setItem('mediaSettings', JSON.stringify(store));
}

const VIManager = {
  checkBrowser: () => {
    return window.VoxImplant.getInstance().isRTCsupported();
  },
  getLocalMedia: () => {
    getStoredCameraAndMic();
    return new Promise((resolve, reject) => {
      const constraints = {
        audio: true,
        video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: 25 },
      };
      if (micId) constraints.audio = { deviceId: micId };
      if (cameraId) constraints.video.deviceId = cameraId;
      else constraints.video.facingMode = 'user';
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          localStream = stream;
          VIManager.prepareAudioNodes(stream, document.querySelector('.mic__level-value')).then(
            () => {
              resolve({ permissions: { video: true, audio: true }, stream });
            }
          );
        })
        .catch(() => {
          constraints.video = false;
          navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
              localStream = stream;
              VIManager.prepareAudioNodes(stream, document.querySelector('.mic__level-value')).then(
                () => {
                  resolve({ permissions: { video: false, audio: true }, stream });
                }
              );
            })
            .catch(reject);
        });
    });
  },
  stopLocalMedia: () => {
    if (localStream) {
      localStream.getTracks().forEach((tr) => tr.stop());
      localStream = null;
    }
    if (audioContext) {
      audioContext.close();
    }
  },
  enableLocalCam: (flag) => {
    if (flag) {
      return refreshCamera();
    } else {
      localStream.getVideoTracks().forEach((tr) => tr.stop());
      return Promise.resolve();
    }
  },
  enableLocalMic: (flag) => {
    localStream.getAudioTracks().forEach((tr) => (tr.enabled = flag));
  },
  changeLocalCam: (newCameraId) => {
    cameraId = newCameraId;
    localStream.getVideoTracks().forEach((tr) => tr.stop());
    return refreshCamera();
  },
  changeLocalMic: (newMicId) => {
    micId = newMicId;
    return new Promise((resolve, reject) => {
      let constraints = { audio: { deviceId: micId }, video: false };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          localStream = new MediaStream([
            ...stream.getAudioTracks(),
            ...localStream.getVideoTracks(),
          ]);
          micNode.disconnect(audioLevelNode);
          micNode = audioContext.createMediaStreamSource(new MediaStream(stream.getAudioTracks()));
          micNode.connect(audioLevelNode);
          resolve(stream);
        })
        .catch(reject);
    });
  },
  getCameraName: () => {
    const tracks = localStream.getVideoTracks();
    if (tracks.length > 0) {
      return tracks[0].label;
    }
    return false;
  },
  getMicName: () => {
    const tracks = localStream.getAudioTracks();
    if (tracks.length > 0) {
      return tracks[0].label;
    }
    return false;
  },
  changeLocalSpeakers: (newSpeakerId) => {
    speakerId = newSpeakerId;
  },
  setSettings: () => {
    setStoredCameraAndMic();
    const { videoSettings, audioSettings } = generateConstraints();
    window.VoxImplant.Hardware.CameraManager.get().setDefaultVideoSettings(videoSettings);
    window.VoxImplant.Hardware.AudioDeviceManager.get().setDefaultAudioSettings(audioSettings);
  },
  setCallSettings: (call) => {
    setStoredCameraAndMic();
    const { videoSettings, audioSettings } = generateConstraints();
    window.VoxImplant.Hardware.CameraManager.get().setCallVideoSettings(call, videoSettings);
    window.VoxImplant.Hardware.AudioDeviceManager.get().setCallAudioSettings(call, audioSettings);
  },
  detectAudioWorklet: () => {
    if (window['OfflineAudioContext']) {
      let context = new window['OfflineAudioContext'](1, 1, 44100);
      return context.audioWorklet && typeof context.audioWorklet.addModule === 'function';
    }
    return false;
  },
  prepareAudioNodes: async (stream, meter) => {
    if (VIManager.detectAudioWorklet()) {
      audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule(
        Env.baseUrl + 'js/audio_worklets/audio-level-processor.js'
      );
      audioLevelNode = new AudioWorkletNode(audioContext, 'audio-level-processor');
      audioLevelNode.port.onmessage = (event) => {
        meter.style.width = Math.ceil(event.data.level * 100) + '%';
      };
      micNode = audioContext.createMediaStreamSource(new MediaStream(stream.getAudioTracks()));
      micNode.connect(audioLevelNode);
      audioLevelNode.connect(audioContext.destination);
    }
  },
};

export { VIManager };
