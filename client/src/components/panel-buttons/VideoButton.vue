<template lang="pug">
.video-button
  PopUpWithChevron.video(:name="iconCamName" :disabled="disabled" size="25px" :tooltip-btn="camTooltip" :tooltip-chevron="t('buttons.cameraSettings')" @update:media="toggleVideo")
    template(v-slot:content)
      .wrap-video
        TitleOption.title(v-if="listCamera.length" :title="t('buttons.selectCamera')")
        RadioInput.item(
          v-for="item in listCamera"
          :item="item.label"
          :checked='isActive(item)'
          @change='updateVideoDevice(item)'
          name="camera"
          )
      .wrap-button
        Button.btn-video-setting(
          mode="flat"
          size="l"
          @click="showVideoSettings"
        ) {{ t('buttons.videoSettings') }}
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, ref } from 'vue';
  import TitleOption from '@/components/settings/TitleOption.vue';
  import PopUpWithChevron from '@/components/popups/PopUpWithChevron.vue';
  import RadioInput from '@/components/inputs/RadioInput.vue';
  import { Button } from '@voximplant/spaceui';
  import { openModal } from '@/store/modal';
  import { useStore } from 'effector-vue/composition';
  import {
    $devices,
    setActiveDevices,
    toggleVideoEvent,
  } from '@/store/devices/index';
  import { requestMirrorStream, toggleMirrorVideoStream } from '@/store/mirrorMedia/index';
  import { useI18n } from 'vue-i18n';
  import { VideoDeviceInfo } from '@/store/devices/VideoDeviceInfo';
  import { AudioDeviceInfo } from '@/store/devices/AudioDeviceInfo';
  const devices = useStore($devices);

  export default defineComponent({
    name: 'VideoButton',
    components: {
      RadioInput,
      PopUpWithChevron,
      TitleOption,
      Button,
    },
    props: {
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    setup() {
      const { t } = useI18n();
      const iconCamName = computed(() =>
        devices.value.videoEnabled ? 'ic25-video-on' : 'ic25-video-off'
      );
      const camTooltip = computed(() =>
        devices.value.videoEnabled ? t('buttons.cameraOff') : t('buttons.cameraOn')
      );
      const listCamera = computed(() => devices.value.videoDevices || []);
      const muted = ref(false);
      const toggleVideo = () => {
        muted.value = !muted.value;
        toggleVideoEvent();
        toggleMirrorVideoStream();
      };
      const updateVideoDevice = (e: VideoDeviceInfo) => {
        if (devices.value.videoEnabled) {
          requestMirrorStream({
            selectedAudioDevice: $devices.getState().selectedAudioDevice,
            selectedVideoDevice: e,
          });
        } else {
          setActiveDevices({ selectedVideoDevice: e });
        }
      };
      const showVideoSettings = () => {
        openModal({ opened: true, componentOptions: { initTab: 'Video' } });
      };
      const isActive = (item: AudioDeviceInfo | never) => {
        return item.value === $devices.getState().selectedVideoDevice?.value;
      };

      onMounted(() => {
        if (!$devices.getState().videoEnabled) {
          muted.value = !muted.value;
        }
      });

      return {
        t,
        iconCamName,
        camTooltip,
        listCamera,
        toggleVideo,
        updateVideoDevice,
        showVideoSettings,
        isActive,
      };
    },
  });
</script>

<style scoped>
  .video-button {
    & .video {
      height: 41px;
    }
    &::v-deep(.popup-wrap) {
      width: 226px;
      left: 48px;
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
    & .wrap-video {
      padding: var(--pad8) 0;
      box-shadow: inset 0 -1px 0 #ebedf2;
    }
    & .wrap-button {
      width: 100%;
      padding: var(--pad8) 0;
    }
    &::v-deep(.sui-button.sui-l).btn-video-setting {
      padding: 10px var(--pad16);
      min-width: 100%;
      border-radius: 0;
      justify-content: flex-start;
    }
    &::v-deep(.sui-button-content) {
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      color: var(--gray900);
    }
  }
</style>
