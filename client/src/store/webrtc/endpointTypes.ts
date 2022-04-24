type TrackTypes = 'audio' | 'video' | 'screen_audio' | 'screen_video';

interface EndpointMidStore {
  [mid: string]: TrackTypes;
}

interface EndpointMediaStore {
  mid: string;
  kind: TrackTypes;
  mediaElement: HTMLMediaElement;
  canPlay: boolean;
}

interface EndpointDescriptionStore {
  id: string;
  mid: EndpointMidStore;
  muted: boolean;
  displayName: string;
  userName: string;
}

interface EndpointStore {
  media: EndpointMediaStore[];
  endpoints: EndpointDescriptionStore[];
}

interface EndpointAdded {
  endpointId: string;
  displayName: string;
  userName: string;
  mids: EndpointMidStore;
  tracks: { [mid: string]: MediaStreamTrack };
}

interface MediaDescription {
  kind: TrackTypes;
  track: MediaStreamTrack;
}

export {
  EndpointStore,
  EndpointDescriptionStore,
  EndpointMediaStore,
  EndpointMidStore,
  TrackTypes,
  EndpointAdded,
  MediaDescription,
};
