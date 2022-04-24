<template lang="pug">
.expanded-settings
  form.form-settings
    .microphone-wrap
      Select.select.microphone(
        :modelValue="devices.selectedAudioDevice"
        @update:modelValue='updateAudioDevice'
        :label="t('settings.microphone')"
        :options="devices.audioDevices"
        :searchable="false"
        placeholder="None"
        :disabled="isAudioDisabled"
        id="microphone"
      )
      Sound

    Select.select(
      v-if="canUseOutputDevice()"
      :modelValue="devices.selectedSpeakerDevices"
      @update:modelValue='updateSpeakerDevice'
      :label="t('settings.speaker')"
      :options="devices.speakerDevices"
      :searchable="false"
      placeholder="None"
      :disabled="!devices.speakerDevices"
    )

    Select.select.camera(
      :modelValue="devices.selectedVideoDevice"
      @update:modelValue='updateVideoDevice'
      :label="t('settings.camera')"
      :options="devices.videoDevices"
      :searchable="false"
      placeholder="None"
      :disabled="!devices.requestDone || devices.videoDisabled"
    )
    Select.select.quality(
      :modelValue="devices.selectedQuality"
      @update:modelValue='updateVideoQuality'
      :label="t('settings.quality')"
      :options="devices.videoQuality"
      :searchable="false"
      placeholder="None"
      :disabled="!devices.requestDone || devices.videoDisabled"
    )
    TogglePanel.toggles(v-if="meeting.owner&&false")
    FileInput(:isDefault="false",v-if="meeting.owner&&false")

</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { Input, Select, Button, Icon } from '@voximplant/spaceui';
  import DownloadedFiles from '@/components/decorative-elements/DownloadedFiles.vue';
  import FileInput from '@/components/inputs/FileInput.vue';
  import TogglePanel from '@/components/settings/TogglePanel.vue';
  import Sound from '@/components/decorative-elements/Sound.vue';
  import Tooltip from '@/components/info/Tooltip.vue';
  import { useStore } from 'effector-vue/composition';
  import { useI18n } from 'vue-i18n';
  import { meetingStore } from '@/store/meeting';
  import { userAgent, Vendor } from '@/helpers/vendor';
  import {
    $devices,
    selectSpeakerDevice,
    setVideoQuality,
    toggleAudioEvent,
    toggleVideoEvent,
  } from '@/store/devices/index';
  import { requestMirrorStream } from '@/store/mirrorMedia/index';
  import { AudioDeviceInfo } from '@/store/devices/AudioDeviceInfo';
  import { VideoDeviceInfo } from '@/store/devices/VideoDeviceInfo';

  export default defineComponent({
    name: 'ExpandedSettings',
    components: {
      Tooltip,
      Input,
      Select,
      Button,
      Icon,
      DownloadedFiles,
      FileInput,
      TogglePanel,
      Sound,
    },
    props: {
      soundIcon: {
        type: String,
        default: require('@/assets/images/mocks/icon-sound.png'),
      },
      text: {
        type: String,
        default: 'Click Test Speaker to make sure you can hear others',
      },
      deviceError: {
        type: String,
        default: '',
        required: false,
      },
    },
    setup(props) {
      const devices = useStore($devices);
      const { t } = useI18n();
      const isAudioDisabled = computed(
        () => !!props.deviceError && props.deviceError !== 'noCamera'
      );
      const meeting = useStore(meetingStore);
      const updateAudioDevice = (e: AudioDeviceInfo) => {
        if (!devices.value.audioEnabled) toggleAudioEvent();
        requestMirrorStream({
          selectedAudioDevice: e,
        });
      };
      const updateSpeakerDevice = (e: AudioDeviceInfo) => {
        selectSpeakerDevice(e);
      };
      const updateVideoDevice = (e: VideoDeviceInfo) => {
        if (!devices.value.videoEnabled) toggleVideoEvent();
        requestMirrorStream({
          selectedVideoDevice: e,
        });
      };
      const updateVideoQuality = (e: Record<string, string>) => {
        setVideoQuality(e);
      };
      const canUseOutputDevice = () => {
        return userAgent === Vendor.chrome;
      };
      return {
        t,
        updateVideoQuality,
        updateAudioDevice,
        updateSpeakerDevice,
        updateVideoDevice,
        meeting,
        devices,
        isAudioDisabled,
        canUseOutputDevice,
      };
    },
  });
</script>

<style scoped>
  .expanded-settings {
    max-width: 324px;
    & .select {
      margin-bottom: var(--pad24);
    }
    & .microphone,
    & .speaker {
      width: 249px;
      margin-right: 12px;
    }
    & .camera,
    & .quality,
    & .input-file-wrap {
      width: 100%;
    }
    & .microphone-wrap,
    & .speaker-wrap {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
    & .button-test {
      padding: 10px 18px 10px 19px;
      border-radius: var(--pad8);
    }
    &::v-deep(.sui-select-head) {
      border-radius: var(--pad8);
      font-family: var(--fontRoboto);
      font-size: 14px;
      line-height: var(--pad20);
      padding: 9px 12px;
    }
    & .toggles {
      margin-bottom: 12px;
    }
  }
</style>
