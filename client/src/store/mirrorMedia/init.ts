import { meetingStore } from '@/store/meeting';
import { endpointEventList } from '@/store/webrtc/endpointManager';
import { $devices, setActiveDevices } from '@/store/devices/index';
import {
  toggleMirrorAudioStream,
  toggleMirrorVideoStream,
  $mirrorStore,
} from '@/store/mirrorMedia/index';
import '@/store/mirrorMedia/onDeviceChange';
import { requestMirrorStream } from '@/store/mirrorMedia/requestMirrorStream';
import { MirrorTracks } from '@/store/mirrorMedia/MirrorTracks';
import { AudioDeviceInfo } from '@/store/devices/AudioDeviceInfo';
import { VideoDeviceInfo } from '@/store/devices/VideoDeviceInfo';

$mirrorStore
  .on(requestMirrorStream.doneData, (_, { mirrorStore, stopped, sharingTracks }) => {
    const meeting = meetingStore.getState().meeting;
    if (meeting) {
      // replace audio always because of MacOS && iPhone
      meeting.replaceMedia(
        { track: stopped.audioPreview as MediaStreamTrack, kind: 'audio' },
        { track: mirrorStore.audioPreview as MediaStreamTrack, kind: 'audio' }
      );
      endpointEventList.updateLocalEndpoint({
        from: { track: stopped.audioPreview as MediaStreamTrack, kind: 'audio' },
        to: { track: mirrorStore.audioPreview as MediaStreamTrack, kind: 'audio' },
      });
      if (!$devices.getState().audioEnabled && mirrorStore.audioPreview)
        mirrorStore.audioPreview.enabled = false;

      if (stopped.videoPreview && !sharingTracks.length) {
        // replace video if camera was changed
        meeting.replaceMedia(
          { track: stopped.videoPreview as MediaStreamTrack, kind: 'video' },
          { track: mirrorStore.videoPreview as MediaStreamTrack, kind: 'video' }
        );
        endpointEventList.updateLocalEndpoint({
          from: { track: stopped.videoPreview as MediaStreamTrack, kind: 'video' },
          to: { track: mirrorStore.videoPreview as MediaStreamTrack, kind: 'video' },
        });
      } else if (stopped.videoPreview && sharingTracks.length) {
        // replace sharing to video
        meeting.replaceMedia(sharingTracks[0], {
          track: mirrorStore.videoPreview as MediaStreamTrack,
          kind: 'video',
        });
        endpointEventList.updateLocalEndpoint({
          from: sharingTracks[0],
          to: { track: mirrorStore.videoPreview as MediaStreamTrack, kind: 'video' },
        });
      } else if ($devices.getState().videoEnabled) {
        // add video
        meeting.addMedia([{ track: mirrorStore.videoPreview as MediaStreamTrack, kind: 'video' }]);
        endpointEventList.updateLocalEndpoint({
          from: null,
          to: { track: mirrorStore.videoPreview as MediaStreamTrack, kind: 'video' },
        });
      }
    }
    return mirrorStore;
  })
  .on(toggleMirrorAudioStream, (store: MirrorTracks) => {
    if (!$devices.getState().audioEnabled) {
      if (store.audioPreview) store.audioPreview.enabled = false;
    } else {
      if (store.audioPreview) store.audioPreview.enabled = true;
    }
    return { ...store };
  })
  .on(toggleMirrorVideoStream, (store: MirrorTracks) => {
    console.error('toggleMirrorVideoStream', $devices.getState().videoEnabled);
    if (!$devices.getState().videoEnabled) {
      const meeting = meetingStore.getState().meeting;
      if (meeting) {
        meeting.removeMedia([{ track: store.videoPreview as MediaStreamTrack, kind: 'video' }]);
        endpointEventList.updateLocalEndpoint({
          from: { track: store.videoPreview as MediaStreamTrack, kind: 'video' },
          to: null,
        });
      }
      store.videoPreview?.stop();

      delete store['videoPreview'];
      return { ...store };
    } else {
      requestMirrorStream({
        selectedVideoDevice: $devices.getState().selectedVideoDevice,
      });
    }
  });

const deviceWatcher = () => {
  const audioSettings = $mirrorStore.getState().audioPreview?.getSettings();
  const videoSettings = $mirrorStore.getState().videoPreview?.getSettings();
  const devices = $devices.getState();
  let selectedAudioDevice: AudioDeviceInfo | undefined = void 0;
  let selectedVideoDevice: VideoDeviceInfo | undefined = void 0;
  if (audioSettings && devices.audioDevices) {
    const selected = devices.audioDevices.find((device) => device.value === audioSettings.deviceId);
    if (selected) selectedAudioDevice = selected;
  }
  if (videoSettings && devices.videoDevices) {
    const selected = devices.videoDevices.find((device) => device.value === videoSettings.deviceId);
    if (selected) selectedVideoDevice = selected;
  }
  if (
    devices.selectedAudioDevice !== selectedAudioDevice ||
    devices.selectedVideoDevice !== selectedVideoDevice
  ) {
    setActiveDevices({ selectedAudioDevice, selectedVideoDevice });
  }
};

$mirrorStore.watch(deviceWatcher);
