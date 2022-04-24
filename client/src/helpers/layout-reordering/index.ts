import { RawOutput } from '@/store/webrtc/endpoints';
import { fixLocalVideo } from './fixLocalVideo';
import { isTilesOrderChanged } from './isTilesOrderChanged';
import { reorderByVad } from './reorderByVad';
import { reorderByVadInSidebar } from './reorderByVadInSidebar';

type ReorderFunction = (mediaTiles: RawOutput[]) => RawOutput[];

export { ReorderFunction, fixLocalVideo, isTilesOrderChanged, reorderByVad, reorderByVadInSidebar };
