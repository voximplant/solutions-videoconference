import { TrackTypes } from '@/store/webrtc/endpointTypes';
import { VideoElement } from '@/store/endpointMedia/VideoElement';
import { VideoTitle } from '@/store/endpointMedia/VideoTitle';

export interface Stream {
  area: number;
  canPlay: boolean;
  kind: TrackTypes;
  video: VideoElement;
  id: string;
  muted: boolean;
  objectFit: 'cover' | 'contain';
  title: VideoTitle;
}
