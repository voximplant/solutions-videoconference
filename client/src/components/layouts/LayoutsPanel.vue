<template lang="pug">
.layouts-panel
  .layouts-wrap(ref="canvas")
    LayoutsVideo(:videos="videoState")
    CallButtonPanel(mode="admin")
  .audio-wrapper
    AudioSlot(v-for="audio of audioState" :key="audio.mid" :audio="audio")
  Popup(v-if="popupOpened" :title="t('invitePeople.title')"  @close="closePopup")
    InvitePeople
  Drawer
    MobileExpandedSettings(v-if="drawerStore.section === 'generalSettings'")
    ChangeLayout(v-if="drawerStore.section === 'changeLayout'")
    ContactList(v-if="drawerStore.section === 'contactList'")
    MenuSettings.menu-drawer(v-if="drawerStore.section === 'settings'" :isMenu="true" mode="admin" )
    ChatArea(v-if="drawerStore.section === 'chat'" :chatList="chatContent.messages")
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import CallButtonPanel from '@/components/settings/CallButtonPanel.vue';
  import { Popup } from '@voximplant/spaceui';
  import { $drawer } from '@/store/drawer';
  import Drawer from '@/components/Drawer.vue';
  import ContactList from '@/components/chat/ContactList.vue';
  import ChatArea from '@/components/chat/ChatArea.vue';
  import MenuSettings from '@/components/settings/MenuSettings.vue';
  import LayoutsVideo from '@/components/layouts/LayoutsVideo.vue';
  import ChangeLayout from '@/components/ChangeLayout.vue';
  import MobileExpandedSettings from '@/components/settings/MobileExpandedSettings.vue';
  import MobileDownloadFile from '@/components/settings/MobileDownloadFile.vue';
  import { $chatContent } from '@/store/chat/index';
  import { useStore } from 'effector-vue/composition';
  import { debounce } from '@/helpers/debounce';
  import { resizeVideoSlot } from '@/store/layout';
  import { toggleInvitePopup, isInvitePopupOpened } from '@/store/popup';
  import PopUpWithButton from '@/components/popups/PopUpWithButton.vue';
  import InvitePeople from '@/components/InvitePeople.vue';
  import { useI18n } from 'vue-i18n';
  import AudioSlot from '@/components/media/AudioSlot.vue';
  import { $audioBucket, $renderVideo } from '@/store/endpointMedia/index';

  export default defineComponent({
    name: 'LayoutsPanel',
    components: {
      AudioSlot,
      Popup,
      PopUpWithButton,
      LayoutsVideo,
      MenuSettings,
      CallButtonPanel,
      Drawer,
      ContactList,
      ChatArea,
      ChangeLayout,
      MobileExpandedSettings,
      MobileDownloadFile,
      InvitePeople,
    },
    setup() {
      const { t } = useI18n();
      const audioState = useStore($audioBucket);
      const chatContent = useStore($chatContent);
      const popupOpened = useStore(isInvitePopupOpened);
      const closePopup = () => {
        toggleInvitePopup(false);
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const canvas = ref<HTMLDivElement>(null);
      const videoState = useStore($renderVideo);
      const drawerStore = useStore($drawer);

      onMounted(async () => {
        const layouts = document.querySelector('.layouts');

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const resizeObserver = new ResizeObserver(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          debounce((element) => {
            const elementOptions = {
              width: element[0].contentRect.width,
              height: element[0].contentRect.height,
            };
            resizeVideoSlot(elementOptions);
          }, 200)
        );
        resizeObserver.observe(layouts);
      });

      return {
        t,
        canvas,
        drawerStore,
        chatContent,
        videoState,
        popupOpened,
        audioState,
        closePopup,
      };
    },
  });
</script>

<style scoped>
  ::v-deep(.popup-content-container) {
    max-width: 400px;
    min-width: 300px !important;
    padding: 32px !important;
    border-radius: 12px !important;
  }
  .layouts-panel {
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    & .layouts-wrap {
      display: flex;
      width: 100%;
      height: 100vh;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      background-color: var(--gray900);
    }
    &::v-deep(.drawer) {
      box-shadow: none;
      overflow: hidden;
      & .wrap {
        padding: 0;
      }
    }
  }
  .audio-wrapper {
    display: none;
  }
</style>
