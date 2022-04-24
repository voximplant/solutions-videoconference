import { Layout } from '@/helpers/layouts';
import { RawOutput } from '@/store/webrtc/endpoints';
import { isTilesOrderChanged } from '@/helpers/layout-reordering';

export const handleTilesOrderByLayout = (layout: Layout, tiles: RawOutput[]) => {
  const newTiles = layout.reorderTiles(tiles);
  return isTilesOrderChanged(tiles, newTiles) ? newTiles : tiles;
};
