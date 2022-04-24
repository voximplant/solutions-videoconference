import { createEvent } from 'effector';
import { $endpoints, $sharing, toggleSharing } from '@/store/webrtc/endpoints';
import { createEffect } from 'effector/compat';
import { $devices } from '@/store/devices/index';
import { requestMirrorStream, $mirrorStore } from '@/store/mirrorMedia/index';
import { meetingStore } from '@/store/meeting';
import {
  EndpointAdded,
  EndpointDescriptionStore,
  EndpointMediaStore,
  EndpointStore,
  MediaDescription,
} from '@/store/webrtc/endpointTypes';
import { ConferenceSignaling } from '@/services/ConferenceSignaling';
import { userAgent, Vendor } from '@/helpers/vendor';
import { clearChat } from '@/store/chat/index';
import { SharingType } from '@/store/sharing';
import { clearUsers, updateUserInCall } from '@/store/users';
import { closeDrawer } from '@/store/drawer';
import { clearLocalReactions } from '@/store/reactions';

const addEndpoint = createEvent<EndpointAdded>();
const canPlay = createEvent<{ mid: string; canPlay: boolean }>();
const updateEndpoint = createEvent<EndpointAdded>();
const removeEndpoint = createEvent<string>();
const updateLocalEndpoint = createEvent<{
  from: MediaDescription | null;
  to: MediaDescription | null;
}>();
const removeSharing = createEvent();
const clearAll = createEvent();

const getMediaElementForKind = (
  track: MediaStreamTrack,
  kind: 'audio' | 'video',
  mid: string
): HTMLMediaElement => {
  const el = document.createElement(kind);
  // console.error(el);
  el.srcObject = new MediaStream([track]);
  el.addEventListener('canplaythrough', () => {
    canPlay({ mid, canPlay: true });
    el.play();
  });
  return el;
};

const createEndpoint = (
  ev: EndpointAdded
): { media: EndpointMediaStore[]; endpoint: EndpointDescriptionStore } => {
  const media: EndpointMediaStore[] = [];
  const localEndpoint = $endpoints.getState().endpoints.find((endpoint) => endpoint.id === 'local');

  Object.keys(ev.mids).forEach((mid: string) => {
    const elType = ev.mids[mid].includes('video') ? 'video' : 'audio';

    // don't render local audio it cause echo effect
    if (ev.endpointId === 'local' && elType === 'audio') {
      return;
    }

    // don't render local screen audio it cause echo effect
    if (
      localEndpoint &&
      ev.userName === localEndpoint.userName &&
      ev.mids[mid] === 'screen_audio'
    ) {
      return;
    }

    media.push({
      mid,
      kind: ev.mids[mid],
      mediaElement: getMediaElementForKind(ev.tracks[mid], elType, mid),
      canPlay: false,
    });
  });
  const endpoint = {
    id: ev.endpointId,
    mid: ev.mids,
    muted: Math.random() >= 0.5,
    displayName: ev.displayName,
    userName: ev.userName,
  };

  return {
    media,
    endpoint,
  };
};

const updateEndpointList = (store: EndpointStore, ev: EndpointAdded): EndpointStore => {
  const newStore: EndpointStore = {
    media: [],
    endpoints: [],
  };

  const endpoint = createEndpoint(ev);
  newStore.media = [...store.media, ...endpoint.media];
  newStore.endpoints = [...store.endpoints, endpoint.endpoint];

  return newStore;
};

const addSharing = createEffect<
  SharingType,
  { type: SharingType; tracks: MediaDescription[] },
  void
>(async (type: SharingType) => {
  let captureStream: MediaStream;
  const audio = type === 'withVideoAndAudio' && userAgent === Vendor.chrome;
  try {
    console.error('sharing', audio, userAgent);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    captureStream = await navigator.mediaDevices.getDisplayMedia({ audio, video: true });
    const videoTrack = captureStream.getVideoTracks()[0];
    const audioTrack = captureStream.getAudioTracks()[0];
    const tracks: MediaDescription[] = [{ track: videoTrack, kind: 'screen_video' }];
    if (audio && audioTrack) tracks.push({ track: audioTrack, kind: 'screen_audio' });
    toggleSharing({ type, tracks });
    videoTrack.onended = () => {
      removeSharing();
    };
    return { type, tracks };
  } catch (e) {
    throw new Error(e);
  }
});

$endpoints
  .on(addEndpoint, (store, event: EndpointAdded) => {
    updateUserInCall({ inCall: true, userName: event.userName, endpointId: event.endpointId });
    return updateEndpointList(store, event);
  })
  .on(removeEndpoint, (store, endpointId) => {
    const selectedEndpoint = store.endpoints.find((endpoint) => endpoint.id == endpointId);
    if (selectedEndpoint) {
      updateUserInCall({
        inCall: false,
        userName: selectedEndpoint.userName,
        endpointId: endpointId,
      });
      const midList = Object.keys(selectedEndpoint.mid);
      store.endpoints = store.endpoints.filter((endpoint) => endpoint.id !== endpointId);
      store.media = store.media.filter((media) => !midList.includes(media.mid));
    }
    return { ...store };
  })
  .on(addSharing.doneData, (store, { type, tracks }) => {
    const meeting = meetingStore.getState().meeting;
    if (!meeting) throw new Error('Cannot find current meeting');
    console.error('addSharing.doneData', type, tracks, meeting);
    if (type === 'replace') {
      const localVideo = $mirrorStore.getState().videoPreview;
      const sharingVideo = tracks.find((track) => track.kind === 'screen_video');
      localVideo?.stop();
      if (sharingVideo) {
        updateLocalEndpoint({
          from: localVideo ? { track: localVideo, kind: 'video' } : null,
          to: sharingVideo,
        });

        if (localVideo) {
          meeting.replaceMedia({ track: localVideo, kind: 'video' }, sharingVideo);
        } else {
          meeting.addMedia([sharingVideo]);
        }
      }
    } else if (type === 'withVideo' || type == 'withVideoAndAudio') {
      meeting.addMedia(tracks);
    }
  })
  .on(removeSharing, () => {
    const typeOfSharing = $sharing.getState().typeOfSharing;
    if (typeOfSharing === 'withVideo' || typeOfSharing === 'withVideoAndAudio') {
      const tracks = $sharing.getState().tracks;
      if (tracks.length) meetingStore.getState().meeting?.removeMedia(tracks);
      toggleSharing({ type: 'none', tracks: [] });
    } else if (typeOfSharing === 'replace' && $devices.getState().videoEnabled) {
      requestMirrorStream({
        selectedAudioDevice: $devices.getState().selectedAudioDevice,
        selectedVideoDevice: $devices.getState().selectedVideoDevice,
        sharingTracks: $sharing.getState().tracks || [],
      });
      toggleSharing({ type: 'none', tracks: [] });
    } else if (typeOfSharing === 'replace' && !$devices.getState().videoEnabled) {
      const tracks = $sharing.getState().tracks;
      if (tracks.length) meetingStore.getState().meeting?.removeMedia(tracks);
      toggleSharing({ type: 'none', tracks: [] });
      updateLocalEndpoint({
        from: tracks[0],
        to: null,
      });
    }
  })
  .on(updateLocalEndpoint, (store, media) => {
    const localEndpoint = store.endpoints.find((endpoint) => endpoint.id == 'local');
    if (localEndpoint) {
      const midList: string[] = Object.keys(localEndpoint.mid);

      // delete track
      if (media.from && !media.to) {
        const mid = midList.find((key: any) => localEndpoint.mid[key] === media.from?.kind);
        if (mid) {
          store.media = store.media.filter((media) => media.mid !== mid);
          delete localEndpoint.mid[mid];
        }
      }

      // add track
      if (!media.from && media.to) {
        const mid = JSON.stringify(Object.keys(localEndpoint.mid).length);
        const elType = media.to.kind.includes('video') ? 'video' : 'audio';
        store.media.push({
          kind: media.to.kind,
          mid,
          mediaElement: getMediaElementForKind(media.to.track, elType, mid),
          canPlay: false,
        });
        localEndpoint.mid[mid] = media.to.kind;
      }

      // replace track
      if (media.from && media.to) {
        const mid = midList.find((key: any) => localEndpoint.mid[key] === media.from?.kind);
        store.media = store.media.map((endpointMediaStore) => {
          if (endpointMediaStore.mid === mid) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            endpointMediaStore.mediaElement.srcObject = new MediaStream([media.to.track]);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            endpointMediaStore.kind = media.to.kind;
          }
          return endpointMediaStore;
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        localEndpoint.mid[mid] = media.to.kind;
      }
    }
    return { ...store };
  })
  .on(updateEndpoint, (store, event) => {
    const endpoint = store.endpoints.find((endpoint) => endpoint.id == event.endpointId);
    if (!endpoint)
      throw new Error(`UpdateEndpoint event was trigged for unknown endpoint ${event.endpointId}`);
    // find prev mids && media for them
    const oldMidList = Object.keys(endpoint.mid);
    const oldMedia: EndpointMediaStore[] = [];
    store.media = store.media.filter((media) => {
      if (oldMidList.includes(media.mid)) {
        oldMedia.push(media);
      }
      return !oldMidList.includes(media.mid);
    });
    console.error('old', oldMedia, oldMidList);

    // check if mids have
    const newMedia: EndpointMediaStore[] = [];
    for (const mid in event.mids) {
      // if we already have media
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (oldMidList.includes(mid) && oldMidList[mid] === event.mids[mid]) {
        const media = oldMedia.find((media) => media.mid === mid);
        if (media) newMedia.push(media);
      } else {
        // create new html element
        const elType = event.mids[mid].includes('video') ? 'video' : 'audio';
        newMedia.push({
          kind: event.mids[mid],
          mid,
          mediaElement: getMediaElementForKind(event.tracks[mid], elType, mid),
          canPlay: false,
        });
      }
    }

    endpoint.mid = event.mids;
    store.media = [...store.media, ...newMedia];
    return { ...store };
  })
  .on(clearAll, () => {
    $mirrorStore.getState().videoPreview?.stop();
    $mirrorStore.getState().audioPreview?.stop();
    $sharing.getState().tracks.forEach(({ track }) => track.stop());
    if ($sharing.getState().isSharing) toggleSharing({ type: 'none', tracks: [] });
    closeDrawer();
    clearLocalReactions();
    clearChat();
    clearUsers();
    meetingStore.getState().meeting?.hangup();
    ConferenceSignaling.disconnect();
    return {
      media: [],
      endpoints: [],
    };
  })
  .on(canPlay, (store, { canPlay, mid }) => {
    store.media = store.media.map((mediaObj) => {
      if (mediaObj.mid === mid) {
        mediaObj.canPlay = canPlay;
      }

      return mediaObj;
    });

    return { ...store };
  });

const endpointEventList = {
  addEndpoint,
  removeEndpoint,
  addSharing,
  removeSharing,
  updateLocalEndpoint,
  updateEndpoint,
  clearAll,
};

export { endpointEventList };
