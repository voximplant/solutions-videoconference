import { RawOutput } from '@/store/webrtc/endpoints';

export type LocalVideoPositionString = 'first' | 'last';

export type LocalVideoPosition = number | LocalVideoPositionString;

export const fixLocalVideo = (mediaTiles: RawOutput[], position: LocalVideoPosition) => {
  if (mediaTiles.length <= 1) return mediaTiles;

  const localVideoIndexMap = {
    first: 0,
    last: mediaTiles.length,
  };
  const currentLocalVideoIndex = mediaTiles.findIndex((tile) => tile.stream.id === 'local');

  if (typeof currentLocalVideoIndex !== 'undefined') {
    const localVideoIndex = typeof position === 'string' ? localVideoIndexMap[position] : position;
    const [localVideoTile] = mediaTiles.splice(currentLocalVideoIndex, 1);
    mediaTiles.splice(localVideoIndex, 0, localVideoTile);
  }

  return mediaTiles;
};
