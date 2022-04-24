import { RawOutput } from '@/store/webrtc/endpoints';
import { $conferenceEndpointsState } from '@/store/conferenceEvents';

export const reorderByVadInSidebar = (
  mediaTiles: RawOutput[],
  overflowIndex: number
): RawOutput[] => {
  if (mediaTiles.length === 1) return mediaTiles;
  const reorderedMediaTiles: RawOutput[] = [];
  const overflowedTiles = mediaTiles.slice(overflowIndex);
  const state = $conferenceEndpointsState.getState();

  mediaTiles.forEach((tile) => {
    const id = tile.stream.id;
    if (state[id]?.vad && overflowedTiles.includes(tile)) {
      return reorderedMediaTiles.unshift(tile);
    }
    reorderedMediaTiles.push(tile);
  });

  return reorderedMediaTiles;
};
