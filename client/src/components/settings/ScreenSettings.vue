<template lang="pug">
.screen-settings
  .screen-wrap
    .screen
      Info.info-screen(:isShow="!!deviceError" :errorInfo="deviceError")
      .video-container.videoSlot(v-if="!deviceError")
        video.video(
          :style="{display: devices.videoEnabled ? 'block' : 'none'}"
          ref="mirrorVideo"
          autoplay="true"
          playsinline)
        userVideoMock.mock(v-if="!devices.videoEnabled" :name="auth.displayName")
      SpeakerName.name(:name="auth.displayName" :isStartSettings="true")
  .footer
    .setting-wrap
      ButtonPanel(:deviceError="deviceError")
    .button-wrap
      Button.button-setting(mode="primary" :disabled="isJoinDisable" @click="goNext") {{ t('join.btn') }}
 
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, ref } from 'vue';
  import { Button } from '@voximplant/spaceui';
  import Info from '@/components/info/Info.vue';
  import ButtonPanel from '@/components/settings/ButtonPanel.vue';
  import SpeakerName from '@/components/settings/SpeakerName.vue';
  import userVideoMock from '@/components/layouts/userVideoMock.vue';
  import { $devices } from '@/store/devices/index';
  import { useStore } from 'effector-vue/composition';
  import { meetingStore, startMeeting } from '@/store/meeting';
  import { authStore } from '@/store/auth';
  import { $mirrorStore } from '@/store/mirrorMedia/index';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'ScreenSettings',
    components: {
      Button,
      Info,
      ButtonPanel,
      SpeakerName,
      userVideoMock,
    },

    props: {
      isShow: {
        type: Boolean,
        default: true,
      },
      deviceError: {
        type: String,
        default: '',
        required: false,
      },
    },
    setup(props) {
      const mirrorVideo = ref<HTMLVideoElement>();
      const meeting = useStore(meetingStore);
      const auth = useStore(authStore);
      const devices = useStore($devices);
      const { t } = useI18n();
      const mirror = useStore($mirrorStore);
      const isJoinDisable = computed(
        () =>
          (!!props.deviceError && props.deviceError !== 'noCamera') ||
          !mirror.value.audioPreview ||
          alreadyJoin.value ||
          !meeting.value.voxMeetingId
      );
      onMounted(() => {
        $mirrorStore.watch((state) => {
          if (state.videoPreview && mirrorVideo.value) {
            mirrorVideo.value.srcObject = new MediaStream([state.videoPreview]);
            mirrorVideo.value?.play();
          }

          if (!state.videoPreview && mirrorVideo.value) {
            mirrorVideo.value.srcObject = null;
          }
        });
      });

      const router = useRouter();
      const alreadyJoin = ref(false);
      const goNext = async () => {
        alreadyJoin.value = true;
        await startMeeting(meeting.value.meetingId || 'default');
        if (meeting.value.meetingId) {
          await router.replace({
            name: 'VideoConference',
            params: {
              conference: meeting.value.meetingId,
            },
          });
        }
      };

      return {
        t,
        isJoinDisable,
        goNext,
        auth,
        devices,
        mirrorVideo,
      };
    },
  });
</script>

<style scoped>
  .mock {
    @media (width >= 768px) {
      border-radius: var(--pad8);
      height: auto;
      min-width: 308px;
      min-height: 231px;
    }
    @media (width >= 1200px) {
      border-radius: var(--pad8);
      height: auto;
      min-width: 586px;
      min-height: 439.5px;
    }
  }
  .screen-settings {
    min-width: 324px;
    margin: 0 auto;
    font-family: var(--fontRoboto);
    font-size: 14px;
    line-height: 20px;
    @media (width < 768px) {
      height: 100vh;
    }
    @media (width >= 768px) {
      border-radius: 12px;
      max-width: 324px;
      box-shadow: 0 2px 4px rgba(40, 41, 61, 0.04), 0 8px 16px rgba(96, 97, 112, 0.16);
    }
    @media (width >= 1200px) {
      max-width: 602px;
    }
    & .footer {
      @media (width < 768px) {
        position: absolute;
        bottom: 0;
        width: 100%;
      }
    }
    & .info-screen {
      padding: 148px 16px;
      @media (width >= 768px) {
        padding: 26px 12px;
      }
      @media (width >= 1200px) {
        padding: 130px 42px;
      }
    }
    & .screen {
      @media (width < 768px) {
        max-width: 100%;
        height: 100%;
      }
      min-width: 320px;
      min-height: 100px;
      margin: 0 auto;
      position: relative;
      background-color: var(--sui-gray-100);
      border-radius: var(--pad16);
      @media (width >= 768px) {
        border-radius: var(--pad8);
        height: auto;
        padding: 0;
        min-width: 308px;
        min-height: 231px;
      }
      @media (width >= 1200px) {
        border-radius: var(--pad8);
        height: auto;
        min-width: 586px;
        min-height: 439.5px;
      }
    }
    & .name {
      position: absolute;
      left: 8px;
      bottom: 8px;
    }
    & .screen-wrap {
      @media (width < 768px) {
        height: calc(100vh - 141px);
        max-height: calc(100vh - 141px);
        max-width: 100%;
      }
      padding: var(--pad16) var(--pad16) 0;
      @media (width >= 768px) {
        padding: var(--pad8) var(--pad8) 0;
      }
    }
    & .button-wrap {
      padding: 0 var(--pad16) var(--pad16);
      @media (width >= 768px) {
        padding: var(--pad24);
      }
    }
    & .setting-wrap {
      padding: 0 var(--pad16);
      @media (width >= 768px) {
        box-shadow: inset 0 -1px 0 #ebedf2;
      }
    }
    &::v-deep(.button-setting) {
      width: 100%;
      max-width: 100%;
      border-radius: var(--pad8);
      justify-content: center;
      padding: 14px var(--pad24);
    }
    &::v-deep(.sui-button-content) {
      font-size: var(--pad16);
    }
    & .video-container {
      width: 100%;
      @media (width <= 768px) {
        height: 100%;
      }
      position: relative;
      overflow: hidden;
      border-radius: var(--pad16);
      @media (width >= 768px) {
        border-radius: var(--pad8);
      }
    }
    & .video {
      @media (width < 768px) {
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
      margin: 0 auto;
      display: block;
      background-color: black;
      transform: scaleX(-1);
      @media (width >= 768px) {
        width: 100%;
        height: auto;
        position: static;
        min-height: 231px;
      }
      @media (width >= 1200px) {
        width: 100%;
        height: auto;
        min-height: 439.5px;
      }
    }
  }
</style>
