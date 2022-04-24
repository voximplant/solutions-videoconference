<template lang="pug">
.panel
  Button.icon(
    v-if="isMobileScreen"
    size='l'
    mode='flat'
    :icon='{ spriteUrl: link, name: settingsIcon, color: "--sui-gray-700" }'
    :disabled="false"
    iconOnly
    @click="toggleDrawer('settings')"
  )
  .video-wrap
    Button.icon.border( 
      size='l'
      mode='flat'
      :icon='{ spriteUrl: link, name: iconMicName, color: "--sui-gray-700" }'
      :disabled="isAudioDisabled"
      iconOnly
      @click="toggleAudio"
    )
    Button.icon.border(
      size='l'
      mode='flat'
      :icon='{ spriteUrl: link, name: iconCamName, color: "--sui-gray-700" }'
      :disabled="devices.videoDisabled"
      iconOnly
      @click="toggleVideo"
    )
  Button.icon(
    v-if="isMobileScreen"
    size='l'
    mode='flat'
    :icon='{ spriteUrl: link, name: moreIcon, color: "--sui-gray-700" }'
    :disabled="false"
    iconOnly
    @click="toggleDrawer('generalSettings')"
  )
  .layout-wrap(v-if="!isMobileScreen")
    // Tooltip.icon(text="Change layout" v-if="meeting.owner")
    Tooltip.icon(:text="t('layout.change')")
      template(v-slot:button)
        Button(
          size='l'
          mode='flat'
          :icon='{ spriteUrl: link, name: layoutsIcon, color: "--sui-gray-700" }'
          :disabled="false"
          iconOnly
          @click="toggleDrawer('changeLayout')"
        )
    // Button.icon(
        size='l'
        mode='flat'
        // :icon='{ spriteUrl: link, name: portraitIcon, color: "--sui-gray-700" }'
        // :disabled="false"
        iconOnly
        )
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { useStore } from 'effector-vue/composition';
  import { Icon, Button } from '@voximplant/spaceui';
  import { useIsMobileScreen } from '@/hooks/useIsMobile';
  import { useI18n } from 'vue-i18n';
  import Tooltip from '@/components/info/Tooltip.vue';
  import { meetingStore } from '@/store/meeting';
  import { toggleAudioEvent, toggleVideoEvent, $devices } from '@/store/devices/index';
  import { toggleMirrorAudioStream, toggleMirrorVideoStream } from '@/store/mirrorMedia/index';
  import { toggleDrawer } from '@/store/drawer';

  export default defineComponent({
    name: 'ButtonPanel',
    components: {
      Tooltip,
      Icon,
      Button,
    },
    props: {
      link: {
        type: String,
        default: '/image/videoconf-icons.svg',
        required: false,
      },
      classes: {
        type: String,
        default: 'disabled',
        required: false,
      },
      settingsIcon: {
        type: String,
        default: 'ic25-settings',
        required: false,
      },
      micIcon: {
        type: String,
        default: 'ic25-mic-on',
        required: false,
      },
      videoIcon: {
        type: String,
        default: 'ic25-video-on',
        required: false,
      },
      moreIcon: {
        type: String,
        default: 'ic25-more',
        required: false,
      },
      layoutsIcon: {
        type: String,
        default: 'ic25-layouts',
        required: false,
      },
      portraitIcon: {
        type: String,
        default: 'ic25-portrait-on',
        required: false,
      },
      deviceError: {
        type: String,
        default: '',
        required: false,
      },
    },
    setup(props) {
      const { isMobileScreen } = useIsMobileScreen();
      const { t } = useI18n();
      const meeting = useStore(meetingStore);
      const devices = useStore($devices);
      const isAudioDisabled = computed(
        () => !!props.deviceError && props.deviceError !== 'noCamera'
      );

      const iconCamName = computed(() =>
        devices.value.videoEnabled ? 'ic25-video-on' : 'ic25-video-off'
      );

      const iconMicName = computed(() =>
        devices.value.audioEnabled ? 'ic25-mic-on' : 'ic25-mic-off'
      );

      const toggleAudio = () => {
        toggleAudioEvent();
        toggleMirrorAudioStream();
      };

      const toggleVideo = () => {
        toggleVideoEvent();
        toggleMirrorVideoStream();
      };

      return {
        isAudioDisabled,
        devices,
        isMobileScreen,
        t,
        meeting,
        iconMicName,
        iconCamName,
        toggleAudio,
        toggleVideo,
        toggleDrawer,
      };
    },
  });
</script>

<style scoped>
  .panel {
    padding: var(--pad16) 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    @media (width >= 768px) {
      justify-content: flex-end;
    }
    & .video-wrap {
      max-height: 44px;
      display: flex;
      flex-wrap: nowrap;
      @media (width >= 768px) {
        margin: auto;
        max-height: 40px;
      }
      @media (width >= 1200px) {
        margin: auto;
      }
    }
    &::v-deep(.sui-icon-only) {
      padding: 10px 10px;
      cursor: pointer;
      width: 45px;
      height: 45px;
      border-radius: var(--pad8);
      @media (width >= 768px) {
        padding: 8px 8px;
        height: 41px;
        width: 41px;
      }
    }
    &::v-deep(.sui-button-icon) {
      width: 25px;
      height: 25px;
    }
    & .border {
      border: 1px solid var(--gray300);
      &:first-child {
        margin-right: var(--pad16);
      }
      @media (width >= 768px) {
        padding: 8px 12px;
        width: 49px;
        &:first-child {
          margin-right: 8px;
        }
      }
      @media (width >= 1200px) {
        &:first-child {
          margin-right: 12px;
        }
      }
    }
    & .disabled {
      background-color: var(--gray100);
    }
    & .layout-wrap {
      display: flex;
      position: absolute;
      flex-wrap: nowrap;
      max-height: 40px;
    }
  }
</style>
