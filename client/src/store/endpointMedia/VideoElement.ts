import { TrackTypes } from '@/store/webrtc/endpointTypes';

export interface VideoElement {
  canPlay: boolean;
  kind: TrackTypes;
  mediaElement: HTMLVideoElement;
  mid: string;
}
