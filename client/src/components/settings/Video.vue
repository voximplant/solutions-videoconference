<template lang="pug">
.video-settings
  .video-container(v-if="!devices.videoDisabled" )
    video.video(
      v-if="devices.videoEnabled"
      ref="mirrorVideo"
      autoplay="true"
      playsinline)
  
  Select.select.camera(
    :modelValue="devices.selectedVideoDevice"
    @update:modelValue='updateVideoDevice'
    :label="t('settings.camera')"
    :options="devices.videoDevices"
    :searchable="false"
    :placeholder="t('none')"
    :disabled="!devices.requestDone || devices.videoDisabled"
  )

  Select.select.quality(
    :modelValue="devices.selectedQuality"
    @update:modelValue='updateVideoQuality'
    :label="t('settings.quality')"
    :options="devices.videoQuality"
    :searchable="false"
    :placeholder="t('none')"
    :disabled="!devices.requestDone || devices.videoDisabled"
  )
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';
  import { Button, Select } from '@voximplant/spaceui';
  import {
    $devices,
    setActiveDevices,
    setVideoQuality,
  } from '@/store/devices/index';
  import { requestMirrorStream, $mirrorStore } from '@/store/mirrorMedia/index';
  import { useStore } from 'effector-vue/composition';
  import { useI18n } from 'vue-i18n';
  import { VideoDeviceInfo } from '@/store/devices/VideoDeviceInfo';
  const devices = useStore($devices);

  export default defineComponent({
    name: 'Video',
    components: {
      Button,
      Select,
    },
    setup() {
      const { t } = useI18n();
      const mirrorVideo = ref<HTMLVideoElement>();

      const updateVideoDevice = (e: VideoDeviceInfo) => {
        if (devices.value.videoEnabled) {
          requestMirrorStream({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            selectedAudioDevice: devices.value.selectedAudioDevice,
            selectedVideoDevice: e,
          });
        } else {
          setActiveDevices({ selectedVideoDevice: e });
        }
      };
      const updateVideoQuality = (e: Record<string, string>) => {
        setVideoQuality(e);
      };

      onMounted(() => {
        $mirrorStore.watch((state) => {
          if (state.videoPreview && mirrorVideo.value) {
            mirrorVideo.value.srcObject = new MediaStream([state.videoPreview]);
            mirrorVideo.value?.play();
          }
        });
      });

      return {
        t,
        devices,
        mirrorVideo,
        updateVideoDevice,
        updateVideoQuality,
      };
    },
  });
</script>

<style scoped>
  .video-settings {
    & .video-container {
      width: fit-content;
      height: fit-content;
      margin-bottom: var(--pad24);
    }
    & .video {
      border-radius: 12px;
      width: 100%;
      height: 100%;
    }
    &::v-deep(.sui-select-head) {
      border-radius: var(--pad8);
    }
  }
</style>
