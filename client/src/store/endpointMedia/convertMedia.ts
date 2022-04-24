import { EndpointStore } from '@/store/webrtc/endpointTypes';
import { CompiledEndpointsMedia, RawOutput } from '@/store/webrtc/endpoints';

export const convertMedia = (media: EndpointStore): RawOutput[] => {
  const endpoints = media.endpoints;
  const mediaFiles = media.media;
  const currentVideoInput: RawOutput[] = [];

  endpoints.forEach((user) => {
    const midKeys = Object.keys(user.mid);
    const userMediaFiles = mediaFiles.filter((media) => midKeys.includes(media.mid));
    const userVideo = userMediaFiles.find((element) => element.kind.includes('video'));
    const isSharing = userMediaFiles.some((element) => element.kind.includes('screen'));
    const stream: CompiledEndpointsMedia = {
      baseHeight: 0,
      baseWidth: 0,
      area: isSharing ? 0 : 1,
      id: user.id,
      objectFit: 'cover',
      muted: user.muted,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      canPlay: userVideo?.canPlay,
      mid: {
        video: userVideo,
      },
      title: {
        label: user.displayName || 'default name',
        padding: 2,
        margin: 8,
        position: 'bottom right',
        background: '',
        color: '',
        width: 0,
        height: 0,
      },
    };

    if (isSharing) currentVideoInput.unshift({ height: 0, left: 0, top: 0, width: 0, stream });
    else currentVideoInput.push({ height: 0, left: 0, top: 0, width: 0, stream });
  });

  return currentVideoInput;
};
