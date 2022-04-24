<template lang="pug">
.menu-button
  PopUpWithButton(name="ic25-more" size="25px")
    template(v-slot:content)
      .content-wrap
        .item-wrap.item-first
          Button.item(
            mode="flat"
            size="l"
            :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-gear', color: '--sui-gray-700', width: '25px', height: '25px'}"
            @click="showModal"
            ref="isGeneralSettings"
          ) {{ t('menuList.generalSettings') }}
        .item-wrap
          Button.item(
            v-for="item in listMenuDefault"
            mode="flat"
            size="l"
            @click="item.click"
            :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: item.icon, color: '--sui-gray-700', width: '25px', height: '25px'}"
            ) {{ item.title }}
        // .item-wrap.item-last
              Button.item(
                mode="flat"
                size="l"
                // :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-report', color: '--sui-gray-700', width: '25px', height: '25px'}"
              ) Report a problem
  Modal
    template(v-slot:default="initTab")
      GeneralSettingsMenu(:currentTabProp="initTab")
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Button } from '@voximplant/spaceui';
  import TitleOption from '@/components/settings/TitleOption.vue';
  import PopUpWithButton from '@/components/popups/PopUpWithButton.vue';
  import MenuSettingsItem from '@/components/inputs/MenuSettingsItem.vue';
  import { openModal } from '@/store/modal';
  import Modal from '@/components/Modal.vue';
  import GeneralSettingsMenu from '@/components/settings/GeneralSettingsMenu.vue';
  import { useI18n } from 'vue-i18n';
  import { useStore } from 'effector-vue/composition.cjs';
  import { $drawer, closeDrawer, openDrawer } from '@/store/drawer';

  export default defineComponent({
    name: 'MenuButton',
    components: {
      GeneralSettingsMenu,
      Modal,
      MenuSettingsItem,
      PopUpWithButton,
      TitleOption,
      Button,
    },
    setup() {
      const { t } = useI18n();
      const isGeneralSettings = ref(false);
      const drawerStore = useStore($drawer);
      const listMenuDefault = [
        /* {
          icon: 'ic25-jamboard',
          title: 'Jamboard',
        },
        {
          icon: 'ic25-background',
          title: 'Background and stickers',
        },
        {
          icon: 'ic25-layouts',
          title: 'Full screen',
        },
        {
          icon: 'ic25-record',
          title: 'Record Screen',
        },
        {
          icon: 'ic25-captioning',
          title: 'Captions',
        }, */
        {
          icon: 'ic25-layouts',
          title: t('menuList.changeLayout'),
          click: () => {
            if (!drawerStore.value.opened) {
              openDrawer('changeLayout');
            } else {
              closeDrawer();
            }
          },
        },
      ];
      return {
        showModal: () => {
          openModal({
            opened: true,
            componentOptions: {
              initTab: 'Profile',
            },
          });
        },
        t,
        listMenuDefault,
        isGeneralSettings,
      };
    },
  });
</script>

<style scoped>
  .menu-button {
    &::v-deep(.popup-wrap) {
      left: auto;
      right: 0;
      min-width: 268px;
    }
    & .item {
      box-shadow: none;
      color: var(--gray800);
      font-size: 14px;
      line-height: var(--pad20);
    }

    &::v-deep(.sui-button.sui-flat).item {
      padding: var(--pad8) var(--pad16);
      border-radius: 0;
      min-width: 100%;
      justify-content: flex-start;
    }

    & .item-first {
      box-shadow: inset 0 -1px 0 var(--gray300);
    }

    & .item-last {
      //box-shadow: inset 0 1px 0 var(--gray300);
    }

    & .item::v-deep(.sui-button-content) {
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      color: var(--gray800);
      margin-left: 12px;
    }

    & .item-last {
      padding: var(--pad16);
      //box-shadow: inset 0 1px 0 var(--gray300);
    }
    & .content-wrap {
      min-width: max-content;
    }
    & .item-wrap {
      padding: var(--pad8) 0;
    }
  }
</style>
