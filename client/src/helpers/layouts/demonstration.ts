import {
  CanvasDef,
  LayoutFabric,
  LayoutTypeMap,
  TileInterface,
  TilerInterfaceItem,
} from '@/helpers/layouts/index';
import { ReorderFunction } from '@/helpers/layout-reordering';
import { fixLocalVideo, reorderByVad } from '@/helpers/layout-reordering';

const forceAspectRatio = 16 / 9;

const demonstrationDefault: TilerInterfaceItem = (canvas: CanvasDef) => {
  return [
    {
      priority: 1,
      width: canvas.width,
      height: canvas.height,
      top: 0,
      left: 0,
      overflow: 'next',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 }],
    },
    {
      priority: 2,
      width: canvas.width * 0.25,
      height: canvas.height * 0.29,
      top: canvas.height - canvas.height * 0.29 - 18,
      left: canvas.width - canvas.width * 0.25 - 18,
      overflow: 'none',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12, forceAspectRatio }],
    },
  ];
};

const demonstrationDefaultScreen: TilerInterfaceItem = (canvas: CanvasDef) => {
  return [
    {
      priority: 0,
      width: canvas.width,
      height: canvas.height,
      top: 0,
      left: 0,
      overflow: 'next',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 }],
    },
    {
      priority: 1,
      width: canvas.width * 0.25,
      height: canvas.height * 0.29,
      top: canvas.height - canvas.height * 0.29 - 18,
      left: canvas.width - canvas.width * 0.25 - 18,
      overflow: 'none',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12, forceAspectRatio }],
    },
  ];
};

const demonstrationMobile: TilerInterfaceItem = (canvas: CanvasDef) => {
  return [
    {
      priority: 1,
      width: canvas.width,
      height: canvas.height,
      top: 0,
      left: 0,
      overflow: 'next',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 }],
    },
    {
      priority: 2,
      width: canvas.width * 0.29,
      height: canvas.height * 0.24,
      top: 16,
      left: canvas.width - canvas.width * 0.29 - 12,
      overflow: 'none',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 }],
    },
  ];
};

const demonstrationMobileScreen: TilerInterfaceItem = (canvas: CanvasDef) => {
  return [
    {
      priority: 0,
      width: canvas.width,
      height: canvas.height,
      top: 0,
      left: 0,
      overflow: 'next',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 }],
    },
    {
      priority: 1,
      width: canvas.width * 0.29,
      height: canvas.height * 0.24,
      top: 16,
      left: canvas.width - canvas.width * 0.29 - 12,
      overflow: 'none',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 }],
    },
  ];
};

const demonstrationTilerMap: TileInterface = {
  default: demonstrationDefault,
  defaultScreen: demonstrationDefaultScreen,
  large: demonstrationDefault,
  largeScreen: demonstrationDefaultScreen,
  mobile: demonstrationMobile,
  mobileScreen: demonstrationMobileScreen,
};

const reorderTiles: ReorderFunction = (mediaTiles) => fixLocalVideo(reorderByVad(mediaTiles), 1);

const createDemonstrationLayout: LayoutFabric = (kind, canvas) => ({
  type: LayoutTypeMap.demonstration,
  kind,
  createTilerDrawAreas: () => demonstrationTilerMap[kind](canvas),
  reorderTiles,
});

export { createDemonstrationLayout };
