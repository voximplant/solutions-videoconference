import { RawOutput } from '@/store/webrtc/endpoints';

export const isTilesOrderChanged = (oldTiles: RawOutput[], newTiles: RawOutput[]): boolean =>
  newTiles.some((tile, i) => tile.stream.id !== oldTiles[i]?.stream.id);
