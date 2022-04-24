<template lang="pug">
.audio-settings
  .audio-wrap
    Select.select.microphone(
      :modelValue="devices.selectedAudioDevice"
      @update:modelValue='updateAudioDevice'
      :label="t('settings.microphone')"
      :options="devices.audioDevices"
      :searchable="false"
      placeholder="None"
      :disabled="!devices.requestDone"
      id="microphone"
    )
    Sound
  .audio-wrap(v-if="canUseOutputDevice()" )
    Select.select(
      :modelValue="devices.selectedSpeakerDevices"
      @update:modelValue='updateSpeakerDevice'
      :label="t('settings.speaker')"
      :options="devices.speakerDevices"
      :searchable="false"
      placeholder="None"
      :disabled="!devices.requestDone"
      id="speaker"
    )
  // .audio-wrap
    ToggleWithText.toggle(
      title="Noise cancelllation"
      description="Filters out sound that isn’t speech")
    .audio-wrap
      Tooltip(text="Click Test Speaker to make sure you can hear others")
        template(v-slot:button)
          Button.button-test(
            size='m'
            mode='secondary'
            // :disabled="false"
          ) Test

</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Button, Select } from '@voximplant/spaceui';
  import Sound from '@/components/decorative-elements/Sound.vue';
  import ToggleWithText from '@/components/toggles/ToggleWithText.vue';
  import Tooltip from '@/components/info/Tooltip.vue';
  import { useStore } from 'effector-vue/composition.cjs';
  import { $devices, selectSpeakerDevice } from '@/store/devices/index';
  import { requestMirrorStream } from '@/store/mirrorMedia/index';
  import { useI18n } from 'vue-i18n';
  import { userAgent, Vendor } from '@/helpers/vendor';
  import { AudioDeviceInfo } from '@/store/devices/AudioDeviceInfo';
  const devices = useStore($devices);

  export default defineComponent({
    name: 'Audio',
    components: {
      Tooltip,
      ToggleWithText,
      Sound,
      Button,
      Select,
    },
    setup() {
      const { t } = useI18n();
      const updateAudioDevice = async (e: AudioDeviceInfo) => {
        await requestMirrorStream({
          selectedAudioDevice: e,
          selectedVideoDevice: $devices.getState().selectedVideoDevice,
        });
      };
      const updateSpeakerDevice = (e: AudioDeviceInfo) => {
        selectSpeakerDevice(e);
      };
      const canUseOutputDevice = () => {
        return userAgent === Vendor.chrome;
      };

      return {
        t,
        canUseOutputDevice,
        updateSpeakerDevice,
        updateAudioDevice,
        devices,
      };
    },
  });
</script>

<style scoped>
  .audio-settings {
    padding-top: var(--pad40);
    &::v-deep(.sui-select-head) {
      border-radius: var(--pad8);
    }
    & .audio-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    & .select {
      margin-right: 12px;
    }
    & .toggle {
      width: 100%;
      box-shadow: none;
      align-items: flex-start;
      padding: 0;
      margin-bottom: var(--pad24);
    }
    & .button-test {
      border-radius: var(--pad8);
      padding: 10px 18px;
    }
  }
</style>
