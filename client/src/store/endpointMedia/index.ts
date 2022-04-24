import { combine, createEvent, createStore } from 'effector';
import { $endpoints } from '@/store/webrtc/endpoints';
import { TrackTypes } from '@/store/webrtc/endpointTypes';
import { convertMedia } from '@/store/endpointMedia/convertMedia';
import { $canvas, $layout } from '@/store/layout';
import { composeVideo } from '@/store/endpointMedia/composeVideo';
import { MediaSettingsStore } from '@/store/endpointMedia/MediaSettingsStore';
import { RenderVideoStore } from '@/store/endpointMedia/RenderVideoStore';
import { handleTilesOrderByLayout } from '@/store/endpointMedia/handleTilesOrderByLayout';

const VAD_UPDATE_DELAY = 1000;
const VIDEO_SIZE_UPDATE_DELAY = 400;

const showOverflowUser = createEvent<number>();
const reorderEndpointMedias = createEvent();
const updateVideoSettings = createEvent<RenderVideoStore[]>();
const enableRemoteVideo = createEvent<{ endpointId: string; active: boolean }>();

const $mediaSettings = createStore<MediaSettingsStore>({});

const $audioBucket = $endpoints.map(({ media }) => {
  const AUDIO_KINDS: TrackTypes[] = ['audio', 'screen_audio'];
  return media.filter(({ kind }) => AUDIO_KINDS.includes(kind));
});

// store contains active and overflowed endpoints
const $convertedMedia = combine($layout, $endpoints.map(convertMedia), handleTilesOrderByLayout);

// store contains only active endpoints (not overflowed)
const $renderVideo = combine($canvas, $convertedMedia, $layout, (canvas, medias, layout) => {
  if (!document.fullscreenElement) {
    return composeVideo(canvas, medias, layout);
  }
});
export {
  VAD_UPDATE_DELAY,
  VIDEO_SIZE_UPDATE_DELAY,
  $audioBucket,
  $mediaSettings,
  $renderVideo,
  $convertedMedia,
  reorderEndpointMedias,
  showOverflowUser,
  updateVideoSettings,
  enableRemoteVideo,
};
