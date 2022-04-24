<template lang="pug">
.audio-button
  PopUpWithChevron.audio(:name="iconMicName" :tooltip-btn="micTooltip" :tooltip-chevron="t('buttons.audioSettings')" size="25px" @update:media="toggleAudio")
    template(v-slot:content)
      .wrap-audio
        TitleOption.title(v-if="listMicrophone.length" :title="t('buttons.selectMicrophone')")
        RadioInput.item(
          v-for="microphone in listMicrophone"
          :item="microphone.label + microphone.kind"
          :label="microphone.label"
          :checked='isAudioActive(microphone)'
          @change='updateAudioDevice(microphone)'
          name="microphone"
          )

        TitleOption.title(v-if="canUseOutputDevice()" :title="t('buttons.selectSpeaker')")
        RadioInput.item(
          v-for="speaker in listSpeaker"
          :item="speaker.label + speaker.kind"
          :label="speaker.label"
          :checked='isSpeakerActive(speaker)'
          @change='updateAudioDevice(speaker)'
          name="speaker"
        )
      .wrap-button
        Button.btn-audio-setting(
          mode="flat"
          size="l"
          @click="showAudioSettings"
        ) {{ t('buttons.audioSettings') }}
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted, computed } from 'vue';
  import Tooltip from '@/components/info/Tooltip.vue';
  import TitleOption from '@/components/settings/TitleOption.vue';
  import PopUpWithChevron from '@/components/popups/PopUpWithChevron.vue';
  import RadioInput from '@/components/inputs/RadioInput.vue';
  import { Button } from '@voximplant/spaceui';
  import { openModal } from '@/store/modal';
  import { useStore } from 'effector-vue/composition.cjs';
  import {
    $devices,
    selectSpeakerDevice,
    toggleAudioEvent,
  } from '@/store/devices';
  import { requestMirrorStream, toggleMirrorAudioStream } from '@/store/mirrorMedia/index';
  import { localMute } from '@/store/conferenceEvents';
  import { useI18n } from 'vue-i18n';
  import { userAgent, Vendor } from '@/helpers/vendor';
  import { AudioDeviceInfo } from '@/store/devices/AudioDeviceInfo';

  export default defineComponent({
    name: 'AudioButton',
    components: {
      Tooltip,
      RadioInput,
      PopUpWithChevron,
      TitleOption,
      Button,
    },
    setup() {
      const { t } = useI18n();
      const devices = useStore($devices);
      const iconMicName = computed(() =>
        devices.value.audioEnabled ? 'ic25-mic-on' : 'ic25-mic-off'
      );
      const micTooltip = computed(() =>
        devices.value.audioEnabled ? t('buttons.audioMute') : t('buttons.audioUnmute')
      );
      const listMicrophone = computed(() => devices.value.audioDevices || []);
      const listSpeaker = computed(() => devices.value.speakerDevices || []);
      const muted = ref(false);
      const toggleAudio = () => {
        muted.value = !muted.value;
        toggleAudioEvent();
        toggleMirrorAudioStream();
        localMute(muted.value);
      };
      const canUseOutputDevice = () => {
        return userAgent === Vendor.chrome;
      };

      const updateAudioDevice = (e: AudioDeviceInfo) => {
        if (e.kind === 'audioinput') {
          requestMirrorStream({
            selectedAudioDevice: e,
          });
        } else if (e.kind === 'audiooutput') {
          selectSpeakerDevice(e);
        }
      };
      const showAudioSettings = () => {
        openModal({ opened: true, componentOptions: { initTab: 'Audio' } });
      };
      const isAudioActive = (item: AudioDeviceInfo) => {
        const { selectedAudioDevice } = $devices.getState();
        return (
          item.groupId === selectedAudioDevice?.groupId && item.label === selectedAudioDevice?.label
        );
      };

      const isSpeakerActive = (item: AudioDeviceInfo) => {
        return (
          item.groupId === devices.value.selectedSpeakerDevices?.groupId &&
          item.label === devices.value.selectedSpeakerDevices.label
        );
      };

      onMounted(() => {
        if (!devices.value.audioEnabled) {
          muted.value = !muted.value;
          toggleMirrorAudioStream();
          localMute(muted.value);
        }
      });

      return {
        t,
        listMicrophone,
        listSpeaker,
        iconMicName,
        micTooltip,
        updateAudioDevice,
        showAudioSettings,
        isAudioActive,
        isSpeakerActive,
        toggleAudio,
        canUseOutputDevice,
      };
    },
  });
</script>

<style scoped>
  .audio-button {
    & .audio {
      height: 41px;
    }
    &::v-deep(.popup-wrap) {
      width: 226px;
      left: auto;
      right: 0;
    }
    & .title {
      width: max-content;
      padding: 12px var(--pad16);
    }
    & .item {
      width: 100%;
    }
    &::v-deep(input:checked ~ .radio-input-wrap) {
      box-shadow: none;
      &::after {
        display: none;
      }
    }
    &::v-deep(.radio-input-wrap) {
      font-size: 14px;
      box-shadow: none;
      padding: 10px var(--pad16);
    }
    & .wrap-audio {
      padding: var(--pad8) 0;
      box-shadow: inset 0 -1px 0 #ebedf2;
    }
    & .wrap-button {
      width: 100%;
      padding: var(--pad8) 0;
    }
    &::v-deep(.sui-button.sui-l).btn-audio-setting {
      padding: 10px var(--pad16);
      min-width: 100%;
      border-radius: 0;
      justify-content: stretch;
    }
    &::v-deep(.sui-button-content) {
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      color: var(--gray900);
    }
  }
</style>
