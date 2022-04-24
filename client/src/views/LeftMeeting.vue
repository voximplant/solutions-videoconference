<template lang="pug">
.left-meeting
  Popup.popup-assess(v-if="!isMobileScreen && popupOpened" :title="t('feedback.assessment.title')" @close="closePopup")
    .popup-content
      Assessment(@update:assessment="assessed = true" v-if="!assessed")
      Feedback(v-if="assessed" @update:closepopup="closePopup")
  Drawer(v-if="isMobileScreen" :showClose="true" :title="t('feedback.assessment.title')" maxHeight="530px")
    Assessment(@update:assessment="assessed = true" v-if="!assessed")
    Feedback(v-if="assessed" @update:closepopup="closePopup")
  .meeting-info
    .content
      Typography(fontType="header" fontSize="600")  {{ t('left.title') }}
      .upper-buttons
        Button.home-button(mode="primary" width="fill-container" @click="goHome") {{ t('left.goHome') }}
        Button.rejoin-button(mode="secondary" width="fit-content" @click="rejoin") {{ t('left.rejoin') }}
      Button(mode="flat" width="fill-container" @click="openPopup") {{ t('left.feedback') }}
  .next-steps(v-if="!isMobilePlatform")
    .next-title
      Typography(fontType="header" fontSize="900") {{ t('next.title') }}
    .blocks-container
      .download
        .image
        .next-step-text
          Typography.title(fontType="header" fontSize="600") {{ t('next.forDevelopers.title') }}
          .text-with-button
            .text
              Typography(fontSize="16px" fontColor="var(--sui-gray-600)") {{ t('next.forDevelopers.description') }}
            Button(mode="secondary" :iconOnly="true" :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic20-chevron-right', height: 20, width: 20 }" @click='openLink("https://github.com/voximplant/solutions-videoconference")')
      .delegate
        .image
        .next-step-text
          Typography.title(fontType="header" fontSize="600") {{ t('next.forNotDevelopers.title') }}
          .text-with-button
            .text
              Typography(fontSize="16px" fontColor="var(--sui-gray-600)") {{ t('next.forNotDevelopers.description') }}
            Button(mode="secondary" :iconOnly="true" :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic20-chevron-right', height: 20, width: 20 }" @click='openLink("https://voximplant.com/platform/video")')
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';
  import { Button, Typography, Popup, Icon } from '@voximplant/spaceui';
  import { useRouter } from 'vue-router';
  import { useStore } from 'effector-vue/composition';
  import { meetingStore } from '@/store/meeting';
  import Assessment from '@/components/feedback/Assessment.vue';
  import Feedback from '@/components/feedback/Feedback.vue';
  import Drawer from '@/components/Drawer.vue';
  import { openDrawer, closeDrawer } from '@/store/drawer';
  import { isPopupOpened, togglePopup } from '@/store/popup';
  import { useI18n } from 'vue-i18n';
  import { useIsMobileScreen, useIsMobilePlatform } from '@/hooks/useIsMobile';

  export default defineComponent({
    name: 'LeftMeeting',
    components: { Drawer, Feedback, Button, Typography, Popup, Icon, Assessment },
    setup() {
      const { t } = useI18n();
      let windowWidth = ref(window.innerWidth);
      const onWidthChange = () => (windowWidth.value = window.innerWidth);
      onMounted(() => window.addEventListener('resize', onWidthChange));
      onUnmounted(() => window.removeEventListener('resize', onWidthChange));
      const { isMobileScreen } = useIsMobileScreen();
      const { isMobilePlatform } = useIsMobilePlatform();
      const popupOpened = useStore(isPopupOpened);
      const openPopup = () => {
        openDrawer();
        togglePopup(true);
      };
      const closePopup = () => {
        togglePopup(false);
        closeDrawer();
      };
      const meeting = useStore(meetingStore);
      const router = useRouter();
      const rejoin = () => {
        /* if (meeting.value.meetingId) {
          router.replace({
            name: 'VideoConference',
            params: {
              conference: meeting.value.meetingId,
            },
          });
        } */
        window.location.href = document.location.href + meeting.value.meetingId;
        /*router.replace({
          name: 'Join',
          params: {
            conference: meeting.value.meetingId || '',
          },
        });*/
      };
      const openLink = (link: string) => {
        window.open(link);
      };
      const goHome = () => {
        /* router.replace({
          name: 'Join',
          params: {
            conference: meeting.value.meetingId || '',
          },
        }); */
        router.replace({
          name: 'Signin',
        });
      };
      const assessed = ref(false);

      return {
        t,
        isMobileScreen,
        isMobilePlatform,
        popupOpened,
        openPopup,
        closePopup,
        goHome,
        rejoin,
        assessed,
        openLink,
      };
    },
  });
</script>

<style scoped>
  .left-meeting {
    display: flex;
    &::v-deep .popup-content-container {
      padding: 24px 32px 32px 32px;
    }
    &::v-deep(.drawer) {
      padding: 32px;
    }
  }
  .popup-content {
    display: flex;
    height: 432px;
    flex-direction: column;
  }
  .meeting-info {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    @media width >= 768px {
      width: 30vw;
    }
  }
  .content {
    max-width: 425px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    gap: 16px;
  }
  .upper-buttons {
    display: flex;
    gap: 14px;
  }
  .home-button::v-deep .text {
    white-space: nowrap;
  }
  .next-steps {
    width: 70vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 42px;
    background-color: var(--sui-gray-50);
    padding: var(--paddingTriple);
  }
  .blocks-container {
    display: flex;
    gap: 24px;
  }
  .download {
    width: 440px;
    border: 4px solid var(--sui-white);
    background-color: var(--sui-white);
    box-sizing: border-box;
    box-shadow: 0 2px 4px rgba(40, 41, 61, 0.04), 0 8px 16px rgba(96, 97, 112, 0.16);
    border-radius: 12px;
    .image {
      max-width: 100%;
      height: 278px;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      background-image: url('../assets/images/gitHub-code.svg');
      background-repeat: no-repeat;
    }
  }
  .delegate {
    width: 440px;
    border: 4px solid var(--sui-white);
    background-color: var(--sui-white);
    box-sizing: border-box;
    box-shadow: 0 2px 4px rgba(40, 41, 61, 0.04), 0 8px 16px rgba(96, 97, 112, 0.16);
    border-radius: 12px;
    .image {
      width: 100%;
      height: 278px;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      background-image: url('../assets/images/voximplant-experts.svg');
      background-repeat: no-repeat;
    }
  }
  .text-with-button {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: 12px;
  }
  .text,
  .title {
    max-width: 299px;
  }
  .next-step-text {
    padding: 0 31px 38px 44px;
  }
</style>
