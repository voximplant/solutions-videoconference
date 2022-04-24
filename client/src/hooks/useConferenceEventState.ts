import { ConferenceEvents } from '@/store/conferenceEvents';
import { onUnmounted, ref } from 'vue';
import { ConferenceSignaling } from '@/services/ConferenceSignaling';

export const useConferenceEventState = (
  event: keyof typeof ConferenceEvents,
  endpointId: string,
  defaultState = false
) => {
  let id =
    endpointId === 'local' && ConferenceSignaling.rand ? ConferenceSignaling.rand : endpointId;
  const eventState = ref<boolean>(defaultState);

  if (id === 'local') {
    ConferenceSignaling.on('hello', () => {
      id = ConferenceSignaling.rand;
    });
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const unsubscribe = ConferenceEvents[event].watch(({ endpoint, enabled }) => {
    if (endpoint === id) {
      eventState.value = enabled;
    }
  });

  onUnmounted(unsubscribe);

  return eventState;
};
