import { RawOutput } from '@/store/webrtc/endpoints';
import { $conferenceEndpointsState, $localEndpointId } from '@/store/conferenceEvents';

export const reorderByVad = (mediaTiles: RawOutput[]): RawOutput[] => {
  if (mediaTiles.length === 1) return mediaTiles;
  const reorderedMediaTiles: RawOutput[] = [];
  const state = $conferenceEndpointsState.getState();

  mediaTiles.forEach((tile) => {
    const id = tile.stream.id === 'local' ? $localEndpointId.getState() : tile.stream.id;
    if (state[id]?.vad) {
      return reorderedMediaTiles.unshift(tile);
    }
    reorderedMediaTiles.push(tile);
  });

  return reorderedMediaTiles;
};
