<template lang="pug">
.audio-slot(ref="audioSlot")
</template>

<script lang="ts">
  import { computed, defineComponent, PropType, ref, watch, watchEffect } from 'vue';
  import { EndpointMediaStore } from '@/store/webrtc/endpointTypes';
  import { useStore } from 'effector-vue/composition';
  import { $devices } from '@/store/devices/index';

  export default defineComponent({
    name: 'AudioSlot',
    props: {
      audio: {
        type: Object as PropType<EndpointMediaStore>,
      },
    },
    setup(props) {
      const audioSlot = ref<HTMLDivElement | null>(null);
      const audioElement = computed(() => props.audio?.mediaElement);

      const appendAudioElement = () => {
        if (!audioSlot.value || !audioElement.value) return;

        audioElement.value.dataset['id'] = props.audio?.mid;
        audioSlot.value.appendChild(audioElement.value);
      };

      watchEffect(() => {
        if (audioElement.value && !audioSlot.value?.contains(audioElement.value)) {
          appendAudioElement();
        }
      });

      const devices = useStore($devices);
      const selectedSpeakerDevice = computed(() => devices.value.selectedSpeakerDevices);

      async function updateSinkId() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await audioElement.value?.setSinkId(selectedSpeakerDevice.value?.value);
      }
      watch([selectedSpeakerDevice, audioElement], updateSinkId);

      return {
        audioSlot,
      };
    },
  });
</script>

<style scoped></style>
