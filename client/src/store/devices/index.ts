import { createEffect, createEvent, createStore } from 'effector';
import { AudioDeviceInfo } from '@/store/devices/AudioDeviceInfo';
import { VideoDeviceInfo } from '@/store/devices/VideoDeviceInfo';
import { ShortDeviceStore } from '@/store/devices/ShortDeviceStore';
import { DevicesStore } from '@/store/devices/DevicesStore';

const $devices = createStore<DevicesStore>({
  requestDone: false,
  videoEnabled: true,
  audioEnabled: true,
  videoDisabled: false,
});

const setActiveDevices = createEvent<{
  selectedAudioDevice?: AudioDeviceInfo;
  selectedVideoDevice?: VideoDeviceInfo;
}>();
const setVideoQuality = createEvent<Record<string, string>>();
const toggleAudioEvent = createEvent();
const toggleVideoEvent = createEvent();
const toggleVideoDisabled = createEvent();
const selectSpeakerDevice = createEvent<AudioDeviceInfo | undefined>();
const getDevices = createEffect<void, ShortDeviceStore, void>();

export {
  $devices,
  getDevices,
  setActiveDevices,
  setVideoQuality,
  selectSpeakerDevice,
  toggleAudioEvent,
  toggleVideoEvent,
  toggleVideoDisabled,
};
