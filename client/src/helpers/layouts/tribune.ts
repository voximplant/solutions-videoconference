import {
  CanvasDef,
  forceAspectRationByCanvas,
  LayoutFabric,
  LayoutTypeMap,
  TileInterface,
  TilerInterfaceItem,
} from '@/helpers/layouts/index';
import { ReorderFunction, reorderByVad } from '@/helpers/layout-reordering';

const tribuneLarge: TilerInterfaceItem = (canvas: CanvasDef) => {
  const forceAspectRatio = forceAspectRationByCanvas(canvas);
  return [
    {
      priority: 1,
      width: canvas.width * 0.7,
      height: canvas.height,
      top: 0,
      left: 0,
      overflow: 'next',
      grid: [
        { fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 },
        { fromCount: 1, toCount: 2, colCount: 2, rowCount: 1, margin: 12 },
        { fromCount: 2, toCount: 4, colCount: 2, rowCount: 2, margin: 12 },
      ],
    },
    {
      priority: 2,
      width: canvas.width * 0.3,
      height: canvas.height,
      top: 0,
      left: canvas.width * 0.7,
      overflow: 'next',
      grid: [
        { fromCount: 1, toCount: 2, colCount: 1, rowCount: 2, margin: 12, forceAspectRatio },
        { fromCount: 2, toCount: 4, colCount: 2, rowCount: 2, margin: 12, forceAspectRatio },
        { fromCount: 4, toCount: 6, colCount: 2, rowCount: 3, margin: 12, forceAspectRatio },
        { fromCount: 6, toCount: 8, colCount: 2, rowCount: 4, margin: 12, forceAspectRatio },
        { fromCount: 8, toCount: 10, colCount: 2, rowCount: 5, margin: 12, forceAspectRatio },
      ],
    },
  ];
};

const tribuneDefault: TilerInterfaceItem = (canvas: CanvasDef) => {
  const forceAspectRatio = forceAspectRationByCanvas(canvas);
  return [
    {
      priority: 1,
      width: canvas.width * 0.85,
      height: canvas.height,
      top: 0,
      left: 0,
      overflow: 'next',
      grid: [
        { fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 },
        { fromCount: 1, toCount: 2, colCount: 2, rowCount: 1, margin: 12 },
        { fromCount: 2, toCount: 4, colCount: 2, rowCount: 2, margin: 12 },
      ],
    },
    {
      priority: 2,
      width: canvas.width * 0.15,
      height: canvas.height,
      top: 0,
      left: canvas.width * 0.85,
      overflow: 'none',
      grid: [{ fromCount: 1, toCount: 5, colCount: 1, rowCount: 5, margin: 12, forceAspectRatio }],
    },
  ];
};

const tribuneDefaultScreen: TilerInterfaceItem = (canvas: CanvasDef) => {
  const forceAspectRatio = forceAspectRationByCanvas(canvas);
  return [
    {
      priority: 0,
      width: canvas.width * 0.85,
      height: canvas.height,
      top: 0,
      left: 0,
      overflow: 'next',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 }],
    },
    {
      priority: 1,
      width: canvas.width * 0.15,
      height: canvas.height,
      top: 0,
      left: canvas.width * 0.85,
      overflow: 'next',
      grid: [
        { fromCount: 1, toCount: 2, colCount: 1, rowCount: 2, margin: 12, forceAspectRatio },
        { fromCount: 2, toCount: 3, colCount: 1, rowCount: 3, margin: 12, forceAspectRatio },
        { fromCount: 3, toCount: 4, colCount: 1, rowCount: 4, margin: 12, forceAspectRatio },
        { fromCount: 4, toCount: 5, colCount: 1, rowCount: 5, margin: 12, forceAspectRatio },
      ],
    },
  ];
};

const tribuneLargeScreen: TilerInterfaceItem = (canvas: CanvasDef) => {
  const forceAspectRatio = forceAspectRationByCanvas(canvas);
  return [
    {
      priority: 0,
      width: canvas.width * 0.7,
      height: canvas.height,
      top: 0,
      left: 0,
      overflow: 'next',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 }],
    },
    {
      priority: 1,
      width: canvas.width * 0.3,
      height: canvas.height,
      top: 0,
      left: canvas.width * 0.7,
      overflow: 'next',
      grid: [
        { fromCount: 1, toCount: 2, colCount: 1, rowCount: 2, margin: 12, forceAspectRatio },
        { fromCount: 2, toCount: 4, colCount: 2, rowCount: 2, margin: 12, forceAspectRatio },
        { fromCount: 4, toCount: 6, colCount: 2, rowCount: 3, margin: 12, forceAspectRatio },
        { fromCount: 6, toCount: 8, colCount: 2, rowCount: 4, margin: 12, forceAspectRatio },
        { fromCount: 8, toCount: 10, colCount: 2, rowCount: 5, margin: 12, forceAspectRatio },
      ],
    },
  ];
};

const tribuneMobile: TilerInterfaceItem = (canvas: CanvasDef) => {
  return [
    {
      priority: 1,
      width: canvas.width,
      height: canvas.height * 0.87,
      top: 0,
      left: 0,
      overflow: 'next',
      grid: [
        { fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 4 },
        { fromCount: 2, toCount: 2, colCount: 1, rowCount: 2, margin: 4 },
        { fromCount: 3, toCount: 4, colCount: 2, rowCount: 2, margin: 4 },
      ],
    },
    {
      priority: 2,
      width: canvas.width,
      height: canvas.width * 0.11,
      top: canvas.height * 0.87 + 4,
      left: 0,
      overflow: 'next',
      grid: [{ fromCount: 1, toCount: 7, colCount: 7, rowCount: 1, margin: [4, 0, 0, 0] }],
    },
  ];
};

const tribuneMobileScreen: TilerInterfaceItem = (canvas: CanvasDef) => {
  return [
    {
      priority: 0,
      width: canvas.width,
      height: canvas.height * 0.74,
      top: 0,
      left: 0,
      overflow: 'next',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 4 }],
    },
    {
      priority: 1,
      width: canvas.width,
      height: canvas.width * 0.24,
      top: canvas.height * 0.74 + 4,
      left: 0,
      overflow: 'next',
      grid: [{ fromCount: 1, toCount: 4, colCount: 4, rowCount: 1, margin: 4 }],
    },
  ];
};

const tribuneTilerMap: TileInterface = {
  default: tribuneDefault,
  defaultScreen: tribuneDefaultScreen,
  large: tribuneLarge,
  largeScreen: tribuneLargeScreen,
  mobile: tribuneMobile,
  mobileScreen: tribuneMobileScreen,
};

const reorderTiles: ReorderFunction = (mediaTiles) => reorderByVad(mediaTiles);

const createTribuneLayout: LayoutFabric = (kind, canvas) => ({
  type: LayoutTypeMap.tribune,
  kind,
  createTilerDrawAreas: () => tribuneTilerMap[kind](canvas),
  reorderTiles,
});

export { createTribuneLayout };
