import { combine, createEvent, restore, Store } from 'effector';
import { CanvasDef, gridBuilder, Layout, LayoutType, LayoutTypeMap } from '@/helpers/layouts';
import { $hasEndpointSharing, $sharing } from '@/store/webrtc/endpoints';

const resizeVideoSlot = createEvent<CanvasDef>();

const $canvas = restore(resizeVideoSlot, { width: 0, height: 0 });

const changeLayoutType = createEvent<LayoutType>();

const $layoutType = restore(changeLayoutType, LayoutTypeMap.grid);

const $layout: Store<Layout> = combine(
  $canvas,
  $layoutType,
  $sharing,
  $hasEndpointSharing,
  (canvas, userSelectedGridName, localSharing, hasEndpointSharing) =>
    gridBuilder({
      ...canvas,
      userSelectedGridName,
      hasSharing: localSharing.isSharing || hasEndpointSharing,
    })
);

export {
  // stores
  $canvas,
  $layoutType,
  $layout,
  // events
  resizeVideoSlot,
  changeLayoutType,
};
