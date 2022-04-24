import { $mirrorStore, requestMirrorStream } from '@/store/mirrorMedia/index';
import { MirrorTracks } from '@/store/mirrorMedia/MirrorTracks';
import { MediaDescription, TrackTypes } from '@/store/webrtc/endpointTypes';
import { $devices } from '@/store/devices/index';
import { detectAudioWorklet, prepareAudioNodes } from '@/helpers/audioWorklet';

requestMirrorStream.use(
  async (
    ev
  ): Promise<{
    mirrorStore: MirrorTracks;
    stopped: MirrorTracks;
    sharingTracks: MediaDescription[];
  }> => {
    const prevAudioPreview = $mirrorStore.getState().audioPreview;
    const prevVideoPreview = $mirrorStore.getState().videoPreview;
    const constraints: MediaStreamConstraints = {};
    if (ev.selectedAudioDevice) {
      constraints.audio = {
        deviceId: ev.selectedAudioDevice.value,
      };
    } else {
      constraints.audio = true;
    }
    if (ev.selectedVideoDevice) {
      constraints.video = {
        deviceId: ev.selectedVideoDevice.value,
        height: { max: 1080, min: 480, ideal: 1080 },
        aspectRatio: { exact: 16 / 9 },
      };
    } else {
      console.error(
        $devices.getState().videoEnabled,
        $devices.getState().selectedVideoDevice
      );
      if (!$devices.getState().videoEnabled) {
        constraints.video = false;
      } else if ($devices.getState().selectedVideoDevice) {
        constraints.video = {
          ...$devices.getState().selectedVideoDevice,
          height: { max: 1080, min: 480, ideal: 1080 },
          aspectRatio: { exact: 16 / 9 },
        };
      } else {
        constraints.video = {
          height: { max: 1080, min: 480, ideal: 1080 },
          aspectRatio: { exact: 16 / 9 },
        };
      }
    }
    let media;
    try {
      media = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      if (e.name === 'OverconstrainedError') {
        // processing of weak cameras that do not support the requested params
        constraints.video = {
          deviceId: ev.selectedVideoDevice?.value,
        }; // reset the params of the requested video
        try {
          media = await navigator.mediaDevices.getUserMedia(constraints); // trying to get a MediaStream again
        } catch (e) {
          throw Error(e.name);
        }
      } else {
        throw Error(e.name);
      }
    }
    const audioTracks = media.getAudioTracks();
    const videoTracks = media.getVideoTracks();
    let audioContext: AudioContext | undefined = void 0;
    if (detectAudioWorklet()) {
      audioContext = await prepareAudioNodes(audioTracks[0]);
    }
    if (audioTracks.length) {
      const audioPreview = audioTracks[0];
      const videoPreview = videoTracks[0];
      prevAudioPreview?.stop();
      prevVideoPreview?.stop();
      const stopped = { audioPreview: prevAudioPreview, videoPreview: prevVideoPreview };
      const sharingTracks: { track: MediaStreamTrack; kind: TrackTypes }[] = ev.sharingTracks || [];
      return {
        mirrorStore: { audioPreview, videoPreview, audioContext },
        stopped,
        sharingTracks,
      };
    } else {
      throw 'No mic devices';
    }
  }
);

export { requestMirrorStream };
