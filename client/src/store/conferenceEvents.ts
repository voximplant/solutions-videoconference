import {
  ConferenceSignaling,
  MuteEvent,
  ResponseEndpointsStateEvent,
  VadEvent,
} from '@/services/ConferenceSignaling';
import { createEvent, createStore, restore } from 'effector';

interface ConferenceEndpointsState {
  [endpoint: string]: {
    vad?: boolean;
    mute?: boolean;
  };
}

const $conferenceEndpointsState = createStore<ConferenceEndpointsState>({});

const ConferenceEvents = {
  vad: createEvent<VadEvent>(),
  mute: createEvent<MuteEvent>(),
};

ConferenceSignaling.on('vad', ConferenceEvents.vad);
ConferenceSignaling.on('mute', ConferenceEvents.mute);

const updateStore = (store: ConferenceEndpointsState, event: VadEvent | MuteEvent) => {
  const { name, endpoint, enabled } = event;
  const endpointState = store[endpoint] || {};
  endpointState[name] = enabled;

  return {
    ...store,
    [endpoint]: endpointState,
  };
};

$conferenceEndpointsState.on([ConferenceEvents.vad, ConferenceEvents.mute], updateStore);

const localMute = createEvent<boolean>();

const sendMuteEvent = (enabled: boolean) => {
  ConferenceSignaling.send('mute', { enabled });
};

localMute.watch(sendMuteEvent);

const handleResponseEndpointsState = (event: ResponseEndpointsStateEvent) => {
  const { endpointsState } = event;

  Object.entries(endpointsState).forEach(([endpoint, stateMap]) => {
    Object.entries(stateMap).forEach(([eventName, enabled]) => {
      const payload = {
        name: eventName,
        endpoint,
        enabled,
      };
      const eventCb = ConferenceEvents[eventName as keyof typeof ConferenceEvents];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      eventCb(payload);
    });
  });
};

ConferenceSignaling.on('responseEndpointsState', handleResponseEndpointsState);

export const updateLocalEndpointId = createEvent<string>();

export const $localEndpointId = restore(updateLocalEndpointId, 'local');

ConferenceSignaling.on('hello', ({ from }) => updateLocalEndpointId(from));

export { localMute, ConferenceEvents, $conferenceEndpointsState };
