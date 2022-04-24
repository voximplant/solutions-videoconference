import { createEffect, createEvent, createStore } from 'effector';
import { AudioDeviceInfo } from '@/store/devices/AudioDeviceInfo';
import { MediaDescription } from '@/store/webrtc/endpointTypes';
import { MirrorTracks } from '@/store/mirrorMedia/MirrorTracks';
import { VideoDeviceInfo } from '@/store/devices/VideoDeviceInfo';

const DEVICE_CHANGE_UPDATE_DELAY = 400;

const $mirrorStore = createStore<MirrorTracks>({});

const toggleMirrorAudioStream = createEvent();
const toggleMirrorVideoStream = createEvent();

const requestMirrorStream = createEffect<
  {
    selectedAudioDevice?: AudioDeviceInfo;
    selectedVideoDevice?: VideoDeviceInfo;
    sharingTracks?: MediaDescription[];
  },
  {
    mirrorStore: MirrorTracks;
    stopped: MirrorTracks;
    sharingTracks: MediaDescription[];
  },
  void
>();

export {
  requestMirrorStream,
  toggleMirrorAudioStream,
  toggleMirrorVideoStream,
  $mirrorStore,
  DEVICE_CHANGE_UPDATE_DELAY,
};
