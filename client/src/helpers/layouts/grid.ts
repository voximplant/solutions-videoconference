import {
  CanvasDef,
  forceAspectRationByCanvas,
  GridKind,
  LayoutFabric,
  LayoutTypeMap,
  TilerInterfaceItem,
} from '@/helpers/layouts/index';
import { RawOutput } from '@/store/webrtc/endpoints';
import { VoxTilerDrawArea } from '@voximplant/tiler';
import { reorderByVadInSidebar, fixLocalVideo } from '@/helpers/layout-reordering';

const gridDefault: TilerInterfaceItem = (canvas: CanvasDef) => {
  const forceAspectRatio = forceAspectRationByCanvas(canvas);
  const getThreeGrid = () => {
    const canvasAspect = canvas.width / canvas.height;
    return canvasAspect > 16 / 9
      ? { fromCount: 3, toCount: 3, colCount: 3, rowCount: 1, margin: 12 }
      : { fromCount: 3, toCount: 3, colCount: 2, rowCount: 2, margin: 12, forceAspectRatio };
  };
  return [
    {
      priority: 0,
      width: canvas.width,
      height: canvas.height,
      top: 0,
      left: 0,
      overflow: 'none',
      grid: [
        { fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 },
        { fromCount: 2, toCount: 2, colCount: 2, rowCount: 1, margin: 12, forceAspectRatio },
        getThreeGrid(),
        { fromCount: 4, toCount: 4, colCount: 2, rowCount: 2, margin: 12, forceAspectRatio },
        { fromCount: 5, toCount: 6, colCount: 3, rowCount: 2, margin: 12, forceAspectRatio },
        { fromCount: 7, toCount: 9, colCount: 3, rowCount: 3, margin: 12, forceAspectRatio },
        { fromCount: 9, toCount: 12, colCount: 4, rowCount: 3, margin: 12, forceAspectRatio },
        { fromCount: 12, toCount: 16, colCount: 4, rowCount: 4, margin: 8, forceAspectRatio },
        { fromCount: 16, toCount: 20, colCount: 5, rowCount: 4, margin: 8, forceAspectRatio },
        { fromCount: 20, toCount: 25, colCount: 5, rowCount: 5, margin: 8, forceAspectRatio },
        { fromCount: 25, toCount: 30, colCount: 6, rowCount: 5, margin: 4, forceAspectRatio },
      ],
    },
  ];
};

const gridDefaultScreen: TilerInterfaceItem = (canvas: CanvasDef) => {
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
      overflow: 'none',
      grid: [{ fromCount: 1, toCount: 5, colCount: 1, rowCount: 5, margin: 12, forceAspectRatio }],
    },
  ];
};

const gridLarge: TilerInterfaceItem = (canvas: CanvasDef) => {
  const forceAspectRatio = forceAspectRationByCanvas(canvas);
  const gridDef = [...gridDefault(canvas)];
  const moreGrid = [
    { fromCount: 30, toCount: 40, colCount: 7, rowCount: 5, margin: 4, forceAspectRatio },
  ];
  gridDef[0].grid = [...gridDef[0].grid, ...moreGrid];
  return gridDef;
};

const gridLargeScreen: TilerInterfaceItem = (canvas: CanvasDef) => {
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
      overflow: 'none',
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

const gridMobile: TilerInterfaceItem = (canvas: CanvasDef) => {
  return [
    {
      priority: 0,
      width: canvas.width,
      height: canvas.height,
      top: 0,
      left: 0,
      overflow: 'none',
      grid: [
        { fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 0 },
        { fromCount: 2, toCount: 2, colCount: 1, rowCount: 2, margin: 5 },
        { fromCount: 3, toCount: 4, colCount: 2, rowCount: 2, margin: 5 },
        { fromCount: 5, toCount: 6, colCount: 2, rowCount: 3, margin: 5 },
        { fromCount: 7, toCount: 9, colCount: 3, rowCount: 3, margin: 5 },
      ],
    },
  ];
};

const gridMobileScreen: TilerInterfaceItem = (canvas: CanvasDef) => {
  return [
    {
      priority: 0,
      width: canvas.width,
      height: canvas.height * 0.56,
      top: 0,
      left: 0,
      overflow: 'next',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: [0, 10, 0, 0] }],
    },
    {
      priority: 1,
      width: canvas.width,
      height: canvas.height * 0.14,
      top: canvas.height * 0.56,
      left: 0,
      overflow: 'none',
      grid: [{ fromCount: 1, toCount: 4, colCount: 4, rowCount: 1, margin: [12, 0, 12, 0] }],
    },
  ];
};

const gridLayoutReorder = (
  gridKind: GridKind,
  drawAreas: VoxTilerDrawArea[],
  mediaTiles: RawOutput[]
) => {
  const hasScreenSharing = gridKind.toLowerCase().includes('screen');
  let reorderedTiles: RawOutput[] = mediaTiles;
  const position = 'last';

  if (hasScreenSharing && drawAreas.length > 1) {
    const [, sidebar] = drawAreas;
    const [gridDefinition] = sidebar.grid;
    const overflowIndex = gridDefinition.rowCount;
    reorderedTiles = reorderByVadInSidebar(mediaTiles, overflowIndex);

    return fixLocalVideo(reorderedTiles, overflowIndex - 1);
  }

  return fixLocalVideo(reorderedTiles, position);
};

const gridTilerMap = {
  default: gridDefault,
  defaultScreen: gridDefaultScreen,
  large: gridLarge,
  largeScreen: gridLargeScreen,
  mobile: gridMobile,
  mobileScreen: gridMobileScreen,
};

const createGridLayout: LayoutFabric = (kind, canvas) => {
  const createTilerDrawAreas = () => gridTilerMap[kind](canvas);

  return {
    type: LayoutTypeMap.grid,
    kind,
    createTilerDrawAreas,
    reorderTiles: (tiles) => gridLayoutReorder(kind, createTilerDrawAreas(), tiles),
  };
};

export { createGridLayout };
