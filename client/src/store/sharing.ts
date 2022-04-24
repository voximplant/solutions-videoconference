import { createEvent, createStore } from 'effector';
import { MediaDescription } from '@/store/webrtc/endpointTypes';

type SharingType = 'replace' | 'withVideo' | 'withVideoAndAudio' | 'none';

interface SharingStore {
  tracks: MediaDescription[];
  isSharing: boolean;
  typeOfSharing: SharingType;
}

const $sharing = createStore<SharingStore>({
  isSharing: false,
  typeOfSharing: 'none',
  tracks: [],
});

const toggleSharing = createEvent<{
  type: SharingType;
  tracks: MediaDescription[];
}>();

$sharing.on(toggleSharing, (store, { type, tracks }) => {
  console.error('toggleSharing', type, tracks);
  const newStore = store;
  if (!tracks.length) {
    if (store.tracks.length) {
      store.tracks.forEach(({ track }) => {
        track.onended = null;
        track.stop();
      });
    }
  }
  newStore.tracks = tracks;
  newStore.isSharing = !newStore.isSharing;
  newStore.typeOfSharing = type;
  console.error('toggleSharing newstore', newStore);
  return { ...newStore };
});

export { $sharing, toggleSharing, SharingStore, SharingType };
