import { $conferenceEndpointsState, localMute } from '@/store/conferenceEvents';
import { ref } from 'vue';
import { useConferenceEventState } from '@/hooks/useConferenceEventState';
import { $devices } from '@/store/devices/index';

export const useMuteState = (endpointId: 'local' | string) => {
  if (endpointId !== 'local') {
    const previousState = $conferenceEndpointsState.getState()[endpointId]?.['mute'] || false;
    return useConferenceEventState('mute', endpointId, previousState);
  }

  const muted = ref(!$devices.getState().audioEnabled);

  localMute.watch((isMuted) => {
    muted.value = isMuted;
  });

  return muted;
};
