import { debounce } from '@/helpers/debounce';
import { $devices, getDevices, setActiveDevices, toggleVideoEvent } from '@/store/devices/index';
import { DEVICE_CHANGE_UPDATE_DELAY, toggleMirrorVideoStream } from '@/store/mirrorMedia/index';
import { AudioDeviceInfo } from '@/store/devices/AudioDeviceInfo';

if (navigator.mediaDevices)
  navigator.mediaDevices.ondevicechange = debounce(async () => {
    const listOldAudioDevices = $devices.getState().audioDevices;
    const oldSelectedVideoDevice = $devices.getState().selectedVideoDevice;

    await getDevices();

    const newSelectedVideoDevice = $devices.getState().selectedVideoDevice;
    if (
      oldSelectedVideoDevice?.value !== newSelectedVideoDevice?.value &&
      $devices.getState().videoEnabled
    ) {
      // checking if the selected video device has changed when the video is enabled
      toggleVideoEvent();
      toggleMirrorVideoStream();
    }

    const listNewAudioDevices = $devices.getState().audioDevices;
    if (listOldAudioDevices && listNewAudioDevices) {
      // find a new audio device
      const newDevice = listNewAudioDevices.filter(
        (newDevice: AudioDeviceInfo) =>
          !listOldAudioDevices.find((oldDevice) => oldDevice.value === newDevice.value)
      );
      if (newDevice.length) setActiveDevices({ selectedAudioDevice: newDevice[0] }); // set new audio device to status active
    }
  }, DEVICE_CHANGE_UPDATE_DELAY);
