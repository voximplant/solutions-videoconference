import { AudioDeviceInfo } from '@/store/devices/AudioDeviceInfo';
import {
  $devices,
  selectSpeakerDevice,
  setActiveDevices,
  setVideoQuality,
  toggleAudioEvent,
  toggleVideoDisabled,
  toggleVideoEvent,
} from '@/store/devices/index';
import { $mirrorStore } from '@/store/mirrorMedia/index';
import { getDevices } from '@/store/devices/getDevices';

$devices
  .on(
    getDevices.doneData,
    (store, { audioDevices, speakerDevices, videoDevices, videoQuality }) => {
      let selectedAudioDevice = audioDevices?.length ? audioDevices?.[0] : void 0;
      let selectedVideoDevice = videoDevices?.length ? videoDevices?.[0] : void 0;
      let selectedSpeakerDevices = speakerDevices?.length ? speakerDevices?.[0] : void 0;
      const audioSettings = $mirrorStore.getState().audioPreview?.getSettings();
      const videoSettings = $mirrorStore.getState().videoPreview?.getSettings();
      if (audioSettings && audioDevices) {
        const audioSelected = audioDevices.find(
          (device: any) => device.value === audioSettings.deviceId
        );
        if (audioSelected) selectedAudioDevice = audioSelected;
      }
      if (audioSettings && speakerDevices) {
        const speakerSelected = speakerDevices.find(
          (device: any) => device.value === audioSettings.deviceId
        );
        if (speakerSelected) selectedSpeakerDevices = speakerSelected;
      }
      if (videoSettings && videoDevices) {
        const videoSelected = videoDevices.find(
          (device: any) => device.value === videoSettings.deviceId
        );
        if (videoSelected) selectedVideoDevice = videoSelected;
      }
      return {
        ...store,
        audioDevices,
        selectedSpeakerDevices,
        selectedAudioDevice,
        selectedVideoDevice,
        speakerDevices,
        videoDevices,
        videoQuality,
        requestDone: true,
        selectedQuality: videoQuality?.[0],
      };
    }
  )
  .on(setActiveDevices, (store, { selectedAudioDevice, selectedVideoDevice }) => {
    const newState = {
      selectedAudioDevice: selectedAudioDevice ?? store.selectedAudioDevice,
      selectedVideoDevice: selectedVideoDevice ?? store.selectedVideoDevice,
    };
    return { ...store, ...newState };
  })
  .on(setVideoQuality, (store, selectedQuality) => {
    return { ...store, selectedQuality };
  })
  .on(toggleAudioEvent, (store) => {
    store.audioEnabled = !store.audioEnabled;
    return { ...store };
  })
  .on(toggleVideoEvent, (store) => {
    store.videoEnabled = !store.videoEnabled;
    return { ...store };
  })
  .on(toggleVideoDisabled, (store) => {
    store.videoDisabled = !store.videoEnabled;
    return { ...store };
  })
  .on(selectSpeakerDevice, (store, selectedSpeakerDevice: AudioDeviceInfo | undefined) => {
    store.selectedSpeakerDevices = selectedSpeakerDevice;
    return { ...store };
  });
