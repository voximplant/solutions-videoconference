<template lang="pug">
.settings-default-wrap
  .settings-default
    Logo.admin-logo(v-if="!isMobileScreen" size="medium")
    .screen-wrap
      ScreenSettings.screen-default(:deviceError="deviceError")
    .setting-wrap(v-if="!isMobileScreen")
      ExpandedSettings.panel-default(:deviceError="deviceError")
  Drawer
    ChangeLayout(v-if="drawerStore.section === 'changeLayout'")
    MenuSettings.menu-drawer(v-if="drawerStore.section === 'settings'" :isMenu="true" mode="default" )
    MobileExpandedSettings(v-if="drawerStore.section === 'generalSettings'" :deviceError="deviceError")
    // MobileDownloadFile(v-if="drawerStatusState.status === 'attachFiles'")
  Popup.popup-assess(v-if="popupOpened")
    .popup-content
      img.allow-devices-img(:src="allowDevicesImg")
      .popup-text-block
        p.popup-title {{ t('error.browserPermission.popUpTitle') }}
        p.popup-text {{ t('error.browserPermission.popUpDescription') }}
        Button(size="m" mode="secondary" width="fill-container"  @click="closePopup") Ok
</template>

<script lang="ts">
  import Logo from '@/components/Logo.vue';
  import { defineComponent } from 'vue';
  import ScreenSettings from '@/components/settings/ScreenSettings.vue';
  import ExpandedSettings from '@/components/settings/ExpandedSettings.vue';
  import { useIsMobileScreen } from '@/hooks/useIsMobile';
  import { closeDrawer, $drawer } from '@/store/drawer';
  import ChangeLayout from '@/components/ChangeLayout.vue';
  import Drawer from '@/components/Drawer.vue';
  import MenuSettings from '@/components/settings/MenuSettings.vue';
  import MobileExpandedSettings from '@/components/settings/MobileExpandedSettings.vue';
  import MobileDownloadFile from '@/components/settings/MobileDownloadFile.vue';
  import { useStore } from 'effector-vue/composition.cjs';
  import { Popup, Button } from '@voximplant/spaceui';
  import Assessment from '@/components/feedback/Assessment.vue';
  import Feedback from '@/components/feedback/Feedback.vue';
  import { isPopupOpened, togglePopup } from '@/store/popup';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'SettingsInDefault',
    components: {
      Logo,
      ScreenSettings,
      ExpandedSettings,
      ChangeLayout,
      Drawer,
      MenuSettings,
      MobileExpandedSettings,
      MobileDownloadFile,
      Popup,
      Button,
      Assessment,
      Feedback,
    },
    props: {
      deviceError: {
        type: String,
        default: '',
        required: false,
      },
    },
    setup() {
      const { t } = useI18n();
      const { isMobileScreen } = useIsMobileScreen();
      const drawerStore = useStore($drawer);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const allowDevicesImg = require('@/assets/images/allowDevicesImg.jpg');
      const popupOpened = useStore(isPopupOpened);
      const closePopup = () => {
        togglePopup(false);
        closeDrawer();
      };

      return {
        popupOpened,
        closePopup,
        isMobileScreen,
        t,
        drawerStore,
        allowDevicesImg,
      };
    },
  });
</script>

<style scoped>
  .settings-default-wrap {
    @media (width >= 768px) {
      display: flex;
      justify-content: space-between;
    }
    & .settings-default {
      @media (width >= 768px) {
        position: relative;
        width: 100%;
      }
      @media (width >= 1200px) {
        display: flex;
        justify-content: center;
        height: 100%;
      }
      &::before {
        @media (width >= 1200px) {
          position: absolute;
          content: '';
          width: 30%;
          height: 100%;
          top: 0;
          left: 0;
          background-color: var(--sui-gray-50);
          z-index: -5;
        }
      }
    }

    & .admin-logo {
      width: 167px;
      height: var(--pad40);
      @media (width >= 768px) {
        position: absolute;
        top: 32px;
        left: 32px;
        z-index: 5;
      }
    }
    & .screen-wrap {
      @media (width >= 768px) {
        padding: 110px 32px var(--pad40);
        background-color: var(--sui-gray-50);
      }
      @media (width >= 1200px) {
        display: flex;
        justify-content: flex-end;
        align-items: flex-start;
        padding: 15vh 70px 32px 32px;
        position: sticky;
        top: 0;
        height: 100vh;
      }
    }
    & .popup-content {
      display: flex;
      flex-direction: column;
      text-align: center;

      & .allow-devices-img {
        height: 100%;
        max-height: 240px;
        width: 100%;
        max-width: 440px;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      & .popup-text-block {
        padding: 32px;

        & .popup-title {
          font-weight: 500;
          font-size: 20px;
          line-height: 24px;
          margin-bottom: 16px;
        }
        & .popup-text {
          font-weight: 400;
          font-size: 16px;
          line-height: 20px;
          color: var(--gray700);
          margin-bottom: 60px;
        }
      }
    }
    & .screen-default {
      align-items: center;
      @media (width >= 1200px) {
        margin: 0;
      }
    }

    & .setting-wrap {
      padding: var(--pad40);
      @media (width >= 1200px) {
        padding: 15vh 32px 32px 60px;
        height: 100%;
      }
    }
    & .panel-default {
      margin: 0 auto;
      @media (width >= 1200px) {
        margin: 0;
        align-items: center;
      }
    }
    &::v-deep(.drawer) {
      @media (width >= 768px) {
        display: block;
        position: relative;
        height: 100vh;
      }
    }
    &::v-deep(.popup-content-container) {
      padding: 0;
      max-width: 440px;
      max-height: 536px;
      border-radius: 12px;
    }
    &::v-deep(.popup-header) {
      display: none;
    }
    &::v-deep(.close-button) {
      display: none;
    }
  }
</style>
