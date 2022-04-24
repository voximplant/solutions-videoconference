<template lang="pug">
div.videoSlot(:class="videoSlotClasses" ref="containerElement" @click="onClickMediaSlot")
  .overlay(v-if="isOverLay")
    .videoQuality
      p {{ reqVideoQuality }}
      p {{ gotVideoQuality }}
  template(v-if="!isOverFlow")
    .video-wrapper(
      v-if="stream.video?.mediaElement && stream.canPlay && isEnabled"
      ref="videoSlot"
    )
    userVideoMock(
      v-else
      :name="stream.title.label"
    )
    .speaker-wrap
      SpeakerName.speaker(
        v-if="isShowNameProps"
        :endpointId="stream.id"
        :name="stream.title.label"
        :hasVideo='!!stream.video?.mediaElement'
      )
      Button(
        v-if="muted"
        mode="alert"
        size="s"
        :icon="{spriteUrl: '/image/videoconf-icons.svg', name: 'ic20-micro-mute', color: '--sui-white', width: '20px', height: '20px'} "
        icon-only)
  usersOverflowMock(
    v-else
    :users="userMedia"
    :index="getOverflowCheckpoint()"
    @click="clickOverflow"
  )
  MediaSlotReactions(:endpointId="tile.stream.id")
</template>

<script lang="ts">
  import SpeakerName from '@/components/settings/SpeakerName.vue';
  import userVideoMock from '@/components/layouts/userVideoMock.vue';
  import usersOverflowMock from '@/components/layouts/usersOverflowMock.vue';
  import { Button } from '@voximplant/spaceui';
  import { defineComponent, ref, computed, watch, onBeforeUnmount, PropType } from 'vue';
  import { useMuteState } from '@/hooks/useMuteState';
  import { useConferenceEventState } from '@/hooks/useConferenceEventState';
  import MediaSlotReactions from '@/components/layouts/MediaSlotReactions.vue';
  import { useStore } from 'effector-vue/composition.cjs';
  import { overflowCheckpoint } from '@/helpers/layouts';
  import { $layout } from '@/store/layout';
  import { openDrawer } from '@/store/drawer';
  import { RenderVideoStore } from '@/store/endpointMedia/RenderVideoStore';
  import { $mediaSettings, $renderVideo, showOverflowUser } from '@/store/endpointMedia';
  import { useIsMobileScreen } from '@/hooks/useIsMobile';

  export default defineComponent({
    name: 'VideoSlot',
    props: {
      tile: {
        type: Object as PropType<RenderVideoStore>,
        required: true,
      },
      index: {
        type: Number,
        required: true,
      },
      isShowName: {
        type: Boolean,
        defaults: true,
      },
      isOverLay: {
        type: Boolean,
        defaults: false,
      },
    },
    components: {
      MediaSlotReactions,
      userVideoMock,
      usersOverflowMock,
      SpeakerName,
      Button,
    },
    setup(props) {
      const { isMobileScreen } = useIsMobileScreen();
      const mediaSettings = useStore($mediaSettings);
      const stream = computed(() => props.tile.stream);
      const isEnabled = computed(
        () =>
          stream.value.id === 'local' ||
          Boolean(mediaSettings.value[stream.value.id]?.[stream.value.video.mid]?.active)
      );
      const reqVideoQuality = computed(
        () => 'req: ' + props.tile.width + ' x ' + props.tile.height
      );
      const gotVideoQuality = ref('No video');
      const getVideoQuality = () => {
        const video = stream.value.video?.mediaElement;
        if (video) {
          const videoTrack = (video.srcObject as MediaStream)?.getVideoTracks();
          const videoSettings = videoTrack[0].getSettings();
          gotVideoQuality.value = 'got: ' + videoSettings.width + ' x ' + videoSettings.height;
        } else {
          gotVideoQuality.value = 'got: ' + 'No video';
        }
      };
      let timerId: number;
      watch(
        () => props.isOverLay,
        (isOverLay) => {
          if (isOverLay) timerId = setInterval(() => getVideoQuality(), 200);
          else clearInterval(timerId);
        },
        { immediate: true }
      );
      onBeforeUnmount(() => clearInterval(timerId));
      let isShowNameProps = ref(props.isShowName);
      const userMedia = useStore($renderVideo);
      const layout = useStore($layout);
      const getOverflowCheckpoint = () => {
        const { type, kind } = layout.value;

        return overflowCheckpoint[type][kind];
      };
      const isOverFlow = computed(() => props.index >= getOverflowCheckpoint());
      const onClickMediaSlot = () => {
        if (!isMobileScreen) return;
        isShowNameProps.value = !isShowNameProps.value;
      };
      const containerElement = ref<HTMLDivElement | null>(null);
      const videoSlot = ref<HTMLDivElement | null>(null);

      const uppUser = () => {
        showOverflowUser(props.index);
      };

      const clickOverflow = () => {
        if (isMobileScreen) openDrawer('contactList');
        else uppUser();
      };

      const appendVideo = () => {
        if (!videoSlot.value) return;
        const mediaElement = stream.value.video?.mediaElement;
        if (containerElement.value && mediaElement) {
          mediaElement.setAttribute('id', stream.value.id);
          videoSlot.value.appendChild(mediaElement);
          if (mediaElement.paused) {
            mediaElement.play().catch((e) => console.error('VideoSlot: playback error', e));
          }
        }
      };
      watch(videoSlot, appendVideo);

      const muted = useMuteState(stream.value.id);
      const isVoiceActive = useConferenceEventState('vad', stream.value.id);
      const videoSlotClasses = computed(() => ({
        'voice-active': !isOverFlow.value && isVoiceActive.value,
      }));

      const isContain = computed(
        () => stream.value.id.includes('local') || stream.value.kind.includes('screen')
      );
      const isScaleX = computed(
        () => stream.value.id.includes('local') && !stream.value.kind.includes('screen')
      );
      const videoStyles = computed(() => ({
        objectFit: isContain.value ? 'contain' : 'cover',
        transform: isScaleX.value ? 'scaleX(-1)' : 'none',
      }));

      return {
        stream,
        reqVideoQuality,
        gotVideoQuality,
        clickOverflow,
        containerElement,
        videoSlot,
        muted,
        isVoiceActive,
        videoSlotClasses,
        videoStyles,
        isShowNameProps,
        onClickMediaSlot,
        userMedia,
        isOverFlow,
        getOverflowCheckpoint,
        isEnabled,
      };
    },
  });
</script>

<style scoped>
  .layouts_debugger {
    position: fixed;
    top: 4px;
    right: 4px;
    z-index: 200;
    padding: 4px;
    background: rgba(0, 255, 0, 0.6);
  }
  .video-wrapper {
    border-radius: 12px;
    width: 100%;
    height: 100%;
  }
  .video-wrapper::v-deep(video) {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background-color: black;
    object-fit: v-bind('videoStyles.objectFit');
    transform: v-bind('videoStyles.transform');
  }
  .speaker-wrap {
    position: absolute;
    bottom: var(--pad8);
    left: var(--pad8);
    display: flex;
    align-items: center;
  }
  .speaker {
    margin-right: 4px;
  }

  .videoSlot {
    position: absolute;
    object-position: center;

    &::v-deep(.sui-button.sui-icon-only.sui-s) {
      padding: 0;
      border-radius: 4px;
    }
    &.voice-active .video-wrapper,
    &.voice-active .video-mock {
      border-color: var(--sui-cyan-300);
    }
  }
  .overlay {
    position: absolute;
    border-radius: 12px;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 1;
    pointer-events: none;

    .videoQuality {
      position: absolute;
      top: 11px;
      left: 11px;
      color: rgba(0, 255, 0, 1);
      font-family: monospace;

      :nth-child(1) {
        margin-bottom: 8px;
      }
    }
  }

  .video-wrapper,
  .video-mock {
    transition: border-color 150ms;
    border: 3px solid transparent;
  }

  .reactions {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }

  .layouts {
    padding: 12px;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
