<template lang="pug">
.layouts
  VideoSlot(
    v-for="(video, index) in videos"
    v-if="isShowMediaElement(videos)"
    :key="JSON.stringify(video.stream)"
    :isShowName="!(videos.length > 5 && isMobileScreen)"
    :isMobile="isMobileScreen"
    :tile="video"
    :isOverLay="isOverLay"
    :index="index"
    :style="{height: `${video.height}px`, width: `${video.width}px`, top: `${video.top}px`, left: `${video.left}px`}"
  )
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import SpeakerName from '@/components/settings/SpeakerName.vue';
  import userVideoMock from '@/components/layouts/userVideoMock.vue';
  import VideoSlot from '@/components/media/VideoSlot.vue';
  import { Button } from '@voximplant/spaceui';
  import { RawOutput } from '@/store/webrtc/endpoints';
  import { useIsMobileScreen } from '@/hooks/useIsMobile';

  export default defineComponent({
    name: 'LayoutsVideo',
    props: {
      videos: {
        type: Array,
        default: () => [],
      },
    },
    components: {
      userVideoMock,
      SpeakerName,
      VideoSlot,
      Button,
    },
    setup() {
      const isOverLay = ref(false);
      const onKeyDown = (ev: KeyboardEvent) => {
        if (ev.altKey && ev.shiftKey) {
          switch (ev.code) {
            case 'KeyS':
              isOverLay.value = !isOverLay.value;
              break;
          }
          ev.preventDefault();
          ev.cancelBubble = true;
        }
      };
      document.addEventListener('keydown', onKeyDown);
      const { isMobileScreen } = useIsMobileScreen();
      const isShowMediaElement = (videos: RawOutput[]) => {
        return videos.length ? videos[0].height > 0 : false;
      };
      return {
        isShowMediaElement,
        isMobileScreen,
        isOverLay,
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
  .layouts {
    margin: 12px;
    width: calc(100% - 24px);
    max-width: calc(100% - 24px);
    height: 100%;
    position: relative;
    overflow: hidden;

    @media (width <= 768px) {
      height: calc(100vh - 99px);
      max-height: calc(100vh - 99px);
    }
  }
</style>
