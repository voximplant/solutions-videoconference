<template lang="pug">
.mobile-menu
  .mobile-menu-wrap(v-if="isMenu")
    MenuSettingsItem(v-if="modes[mode] === modes.default")(
      v-for="item in listMenuDefault"
      :icon="item.icon"
      :title="item.title"
      :isDisabled="item.isDisabled"
      @click="changeStatus(item.type)"
      )
    MenuSettingsItem(v-if="modes[mode] === modes.admin")(
      v-for="item in listMenuAdmin"
      :icon="item.icon"
      :title="item.title"
      :isDisabled="item.isDisabled"
      :isActivated="item.isActivated"
      @click="changeStatus(item.type)"
    )
    EmojiPanel.emojis(v-if="modes[mode] !== modes.default")
    .btn-cancel-slot
      Button.btn-cancel(
        size="l"
        mode="outlined"
        @click="closeDrawer"
        ) {{ t('cancel') }}
    // .mobile-setting-menu(v-else)
      Button.done-btn(
        size="s"
        mode="flat"
        @click="closeDrawer"
      ) {{ t('done') }}
      .mobile-menu-container(v-if="modes[mode] === modes.audio")
        p.title {{ t('settings.microphone') }}
        RadioInput(
          v-for="item in listMicrophone"
          //:item="item"
          //:name="t('settings.microphone')"
          )
        p.title {{ t('settings.speaker') }}
        RadioInput(
          v-for="item in listSpeaker"
          //:item="item"
          // :name="t('settings.speaker')"
          )
      .mobile-menu-container(v-if="modes[mode] === modes.camera")
        p.title {{ t('settings.camera') }}
        RadioInput(
          v-for="item in listCamera"
          // :item="item"
          //:name="t('settings.camera')"
          )
      .mobile-menu-container(v-if="modes[mode] === modes.permission")
        TogglePanel.toggle-panel
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import MenuSettingsItem from '@/components/inputs/MenuSettingsItem.vue';
  import { Button } from '@voximplant/spaceui';
  import { closeDrawer, DrawerSection, openDrawer } from '@/store/drawer';
  import RadioInput from '@/components/inputs/RadioInput.vue';
  import TogglePanel from '@/components/settings/TogglePanel.vue';
  import EmojiPanel from '@/components/chat/EmojiPanel.vue';
  import { resizeVideoSlot } from '@/store/layout';
  import { useI18n } from 'vue-i18n';

  interface MobileMode {
    audio?: string;
    camera?: string;
    permission?: string;
    default?: string;
    admin?: string;
  }
  const modes: MobileMode = {
    audio: 'audio', // only when isMenu = false
    camera: 'camera', // only when isMenu = false
    permission: 'permission', // only when isMenu = false
    default: 'default', // only when isMenu = true
    admin: 'admin', // only when isMenu = true
  };

  export default defineComponent({
    name: 'MenuSettings',
    components: {
      EmojiPanel,
      TogglePanel,
      MenuSettingsItem,
      Button,
      RadioInput,
    },
    props: {
      mode: {
        type: String as PropType<keyof MobileMode>,
        default: 'audio',
      },
      isMenu: {
        type: Boolean,
        default: true,
      },
    },
    setup() {
      const { t } = useI18n();
      const titlePermission = t('settings.option');
      const listMenuAdmin = [
        {
          icon: 'ic25-settings-on',
          title: t('menuList.generalSettings'),
          type: 'generalSettings',
        },
        {
          icon: 'ic25-chat-purple',
          title: t('menuList.chat'),
          type: 'chat',
        },
        {
          icon: 'ic25-users-purple',
          title: t('menuList.contactList'),
          type: 'contactList',
        },
        /*{
                icon: 'ic25-portrait-purple',
                title: 'Background and stickers',
              },*/
        {
          icon: 'ic25-layouts-on',
          title: t('menuList.changeLayout'),
          type: 'changeLayout',
        },
        /*{
                icon: 'ic25-caption-purple',
                title: 'Captions',
              },*/
        /*{
                icon: 'ic25-attachment-on',
                title: 'Attach files',
                type: 'attachFiles',
              },*/
        /*{
                icon: 'ic25-record-purple',
                title: 'Record screen',
                isActivated: false,
              },*/
      ];
      const listMenuDefault = [
        {
          icon: 'ic25-settings-on',
          title: t('menuList.generalSettings'),
          type: 'generalSettings',
        },
        /* {
            icon: 'ic25-portrait-off',
            title: 'Background and stickers',
            isDisabled: true,
          }, */
        {
          icon: 'ic25-layouts-on',
          title: t('menuList.changeLayout'),
          type: 'changeLayout',
        },
        /*{
            icon: 'ic25-attachment-on',
            title: 'Attach files',
            type: 'attachFiles',
          },*/
      ];
      const changeStatus = (status: DrawerSection) => {
        openDrawer(status);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resizeVideoSlot();
      };

      return {
        t,
        listMenuAdmin,
        listMenuDefault,
        closeDrawer,
        changeStatus,
        modes,
        titlePermission,
      };
    },
  });
</script>

<style scoped>
  .mobile-menu {
    border-radius: var(--pad16);
    & .btn-cancel {
      border: none;
      display: block;
      margin: auto;
    }
    & .btn-cancel-slot {
      padding: 24px 0;
    }
    & .mobile-setting-menu {
      width: 100%;
      position: relative;
      font-family: var(--fontRoboto);
    }
    & .emojis {
      margin: var(--pad24) 14px 0 14px;
    }
    & .title {
      color: var(--gray800);
      font-weight: 500;
      font-size: var(--pad24);
      line-height: 28px;
      padding: var(--pad16);
    }
    & .done-btn {
      position: absolute;
      right: var(--pad16);
      top: var(--pad16);
    }
    &::v-deep(.sui-button-content) {
      font-size: var(--pad16);
      line-height: var(--pad20);
    }
    &::v-deep(.title) {
      font-size: var(--pad24);
      line-height: 28px;
      padding: var(--pad16);
      margin-bottom: 0;
    }
    &::v-deep(.toggle-with-text) {
      padding: var(--pad16);
      &:last-child {
        box-shadow: none;
      }
    }
  }
</style>
