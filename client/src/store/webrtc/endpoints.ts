import { createStore } from 'effector';
import { VoxTilerInput } from '@voximplant/tiler';
import { EndpointStore, EndpointMediaStore } from '@/store/webrtc/endpointTypes';
import { $sharing, toggleSharing } from '@/store/sharing';

export interface SocketPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface media {
  audio?: EndpointMediaStore;
  video?: EndpointMediaStore;
}

export interface CompiledEndpointsMedia extends VoxTilerInput {
  mid: media;
  muted: boolean;
  canPlay: boolean;
}

interface RawOutput extends SocketPosition {
  stream: CompiledEndpointsMedia;
}

const $endpoints = createStore<EndpointStore>({
  media: [],
  endpoints: [],
});

const $hasEndpointSharing = $endpoints.map(({ media }) =>
  media.some((endpoint) => endpoint.kind === 'screen_video')
);

export { RawOutput, $endpoints, $sharing, $hasEndpointSharing, toggleSharing };
