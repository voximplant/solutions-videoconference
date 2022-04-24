import { VoxTilerDrawArea } from '@voximplant/tiler';
import { createDemonstrationLayout } from '@/helpers/layouts/demonstration';
import { createGridLayout } from '@/helpers/layouts/grid';
import { createTribuneLayout } from '@/helpers/layouts/tribune';
import { RawOutput } from '@/store/webrtc/endpoints';

interface CanvasDef {
  width: number;
  height: number;
}

type TilerInterfaceItem = (canvas: CanvasDef) => VoxTilerDrawArea[];

const LayoutTypeMap = {
  demonstration: 'demonstration',
  grid: 'grid',
  tribune: 'tribune',
} as const;

const ScreenKindMap = {
  mobile: 'mobile',
  default: 'default',
  large: 'large',
} as const;

type ScreenKind = typeof ScreenKindMap[keyof typeof ScreenKindMap];

type LayoutType = typeof LayoutTypeMap[keyof typeof LayoutTypeMap];

type GridKind = `${ScreenKind}` | `${ScreenKind}Screen`;

type TileInterface = {
  [K in GridKind]: TilerInterfaceItem;
};

interface Layout {
  type: LayoutType;
  kind: GridKind;
  createTilerDrawAreas: () => VoxTilerDrawArea[];
  reorderTiles: (tiles: RawOutput[]) => RawOutput[];
}

type LayoutFabric = (kind: GridKind, canvas: CanvasDef) => Layout;

interface GridBuilderParams {
  width: number;
  height: number;
  hasSharing: boolean;
  userSelectedGridName: LayoutType;
}

const overflowCheckpoint: Record<LayoutType, Record<GridKind, number>> = {
  [LayoutTypeMap.grid]: {
    default: 30,
    defaultScreen: 5,
    large: 40,
    largeScreen: 10,
    mobile: 9,
    mobileScreen: 4,
  },
  [LayoutTypeMap.tribune]: {
    default: 8,
    defaultScreen: 5,
    large: 10,
    largeScreen: 10,
    mobile: 7,
    mobileScreen: 4,
  },
  [LayoutTypeMap.demonstration]: {
    default: 2,
    defaultScreen: 2,
    large: 2,
    largeScreen: 2,
    mobile: 2,
    mobileScreen: 2,
  },
};

const mockGrid: TilerInterfaceItem = (canvas: CanvasDef) => {
  return [
    {
      priority: 0,
      width: canvas.width,
      height: canvas.height,
      top: 0,
      left: 0,
      overflow: 'none',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 }],
    },
    {
      priority: 1,
      width: canvas.width * 0.25,
      height: canvas.height * 0.29,
      top: canvas.height - canvas.height * 0.29 - 18,
      left: canvas.width - canvas.width * 0.25 - 18,
      overflow: 'none',
      grid: [{ fromCount: 1, toCount: 1, colCount: 1, rowCount: 1, margin: 12 }],
    },
  ];
};

const gridList: Record<LayoutType, LayoutFabric> = {
  [LayoutTypeMap.grid]: createGridLayout,
  [LayoutTypeMap.demonstration]: createDemonstrationLayout,
  [LayoutTypeMap.tribune]: createTribuneLayout,
};

function getScreenKind(width: number, height: number): ScreenKind {
  if (height > width) {
    return ScreenKindMap.mobile;
  }
  if (width >= 1920 && height >= 1080) {
    return ScreenKindMap.large;
  }

  return ScreenKindMap.default;
}

function getGridKind({
  screenKind,
  hasSharing,
}: {
  screenKind: ScreenKind;
  hasSharing: boolean;
}): GridKind {
  const sharingPart = hasSharing ? 'Screen' : '';
  return `${screenKind}${sharingPart}` as GridKind;
}

function gridBuilder({
  width,
  height,
  hasSharing,
  userSelectedGridName,
}: GridBuilderParams): Layout {
  const screenKind = getScreenKind(width, height);
  const gridKind = getGridKind({ screenKind, hasSharing });

  return gridList[userSelectedGridName](gridKind, { width, height });
}

const forceAspectRationByCanvas = ({ width, height }: CanvasDef) => {
  const canvasAspect = width / height;
  return canvasAspect > 1.4 ? 16 / 9 : 0;
};

export {
  Layout,
  LayoutType,
  GridKind,
  ScreenKind,
  LayoutTypeMap,
  LayoutFabric,
  TileInterface,
  mockGrid,
  gridBuilder,
  CanvasDef,
  TilerInterfaceItem,
  GridBuilderParams,
  overflowCheckpoint,
  forceAspectRationByCanvas,
};
