import { Layout } from '@/helpers/layouts';
import { $endpoints, RawOutput, toggleSharing } from '@/store/webrtc/endpoints';
import { isTilesOrderChanged } from '@/helpers/layout-reordering';
import { sample } from 'effector';
import { $layout, changeLayoutType } from '@/store/layout';
import { ConferenceEvents } from '@/store/conferenceEvents';
import { throttle } from '@/helpers/throttle';
import {
  $renderVideo,
  showOverflowUser,
  reorderEndpointMedias,
  VAD_UPDATE_DELAY,
  $convertedMedia,
  $mediaSettings,
  updateVideoSettings,
  VIDEO_SIZE_UPDATE_DELAY,
  enableRemoteVideo,
} from '@/store/endpointMedia/index';
import {
  ConferenceSignaling,
  ManageEndpointsPayload,
  RequestVideoSizePayload,
} from '@/services/ConferenceSignaling';
import { MediaSettingsStore } from '@/store/endpointMedia/MediaSettingsStore';
import { EndpointStore } from '@/store/webrtc/endpointTypes';

const handleTilesOrderByLayout = (layout: Layout, tiles: RawOutput[]) => {
  const newTiles = layout.reorderTiles(tiles);
  return isTilesOrderChanged(tiles, newTiles) ? newTiles : tiles;
};
sample({
  clock: [changeLayoutType, reorderEndpointMedias, toggleSharing],
  source: [$layout, $convertedMedia],
  fn: (stores) => handleTilesOrderByLayout(...stores),
  target: $convertedMedia,
});

$convertedMedia.on(showOverflowUser, (state, index) => {
  const newStore = state;
  [newStore[index - 1], newStore[index]] = [newStore[index], newStore[index - 1]];
  return [...newStore];
});

ConferenceEvents.vad.watch(
  throttle(({ enabled }) => {
    if (enabled) {
      reorderEndpointMedias();
    }
  }, VAD_UPDATE_DELAY)
);

$renderVideo.watch((composedVideo) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  throttle(updateVideoSettings(composedVideo), VIDEO_SIZE_UPDATE_DELAY);
});

$mediaSettings
  .on(updateVideoSettings, (_, renderMedia) => {
    const newStore: MediaSettingsStore = {};
    if (renderMedia?.length) {
      renderMedia.forEach((media) => {
        if (media.stream.id !== 'local' && media.stream.video) {
          newStore[media.stream.id] = {
            [media.stream.video.mid]: {
              active: true,
              kind: media.stream.kind,
              width: media.width,
              height: media.height,
            },
          };
        }
      });
    }
    requestVideoSize(newStore);
    return { ...newStore };
  })
  .on(enableRemoteVideo, (store, { endpointId, active }) => {
    for (const mid in store[endpointId]) {
      if (store[endpointId][mid].kind.includes('video')) store[endpointId][mid].active = active;
    }
    return { ...store };
  });

const requestVideoSize = (store: MediaSettingsStore) => {
  const payload: RequestVideoSizePayload = {};
  for (const endpointId in store) {
    for (const mid in store[endpointId]) {
      const midMedia = store[endpointId][mid];
      if (midMedia.active && midMedia.kind.includes('video')) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        payload[endpointId] = { [mid]: [midMedia.width, midMedia.height] };
      }
    }
  }
  if (Object.keys(payload).length) ConferenceSignaling.send('requestVideoSize', { payload });
};

const manageEndpoints = (mediaSettingsStore: MediaSettingsStore, endpointStore: EndpointStore) => {
  const payload: ManageEndpointsPayload = endpointStore.endpoints.reduce((payload, endpoint) => {
    if (endpoint.id === 'local') return payload;
    const audio: string[] = [];
    for (const midKey in endpoint.mid) {
      if (endpoint.mid[midKey].includes('audio')) audio.push(midKey);
    }
    return { ...payload, [endpoint.id]: { audio, video: [] } };
  }, {});

  for (const endpointIdStore in mediaSettingsStore) {
    for (const mid in mediaSettingsStore[endpointIdStore]) {
      const midMedia = mediaSettingsStore[endpointIdStore][mid];
      if (midMedia.active) payload[endpointIdStore].video.push(mid);
    }
  }
  if (Object.keys(payload).length) ConferenceSignaling.send('manageEndpoints', { payload });
};

$mediaSettings.watch((store) => {
  manageEndpoints(store, $endpoints.getState());
});
