<template lang="pug">
.speaker-button
  PopUpWithButton.speaker-popup-wrap(:isDefaultButton="false")
    template(v-slot:content="{ toggleDropdown }")
      .wrap-setting
        Button.item.item-first(
          v-for="item of listMenu"
          mode="flat"
          :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: item.icon, color: '--sui-gray-700', width: '25px', height: '25px'}"
          size="l"
          @click="(() => {item.click(); toggleDropdown()})"
        ) {{ item.title }}
      .wrap-setting(v-if="isAdmin")
        Toggle.toggle-option(
          v-for="toggle in listToggles"
          :label="toggle"
          :isLabelFirst="false"
          size="s"
        )
      .wrap-setting(v-if="isAdmin")
        TitleOption.title-setting(:title="t('speakerMenuList.allow')")
        Toggle.toggle-option(
          v-for="toggle in listAllowUsers"
          :label="toggle"
          :isLabelFirst="false"
          size="s"
          :modelValue="true"
        )
    template(v-slot:button)
      Button.bnt-setting(
        mode="flat"
        size="s"
        :icon="{ name: 'ic16-more-ver', color: '--sui-white', width: '20px', height: '20px'} "
        icon-only
      )
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { Button, Toggle } from '@voximplant/spaceui';
  import PopUpWithButton from '@/components/popups/PopUpWithButton.vue';
  import TitleOption from '@/components/settings/TitleOption.vue';
  import { useI18n } from 'vue-i18n';
  import { enableRemoteVideo } from '@/store/endpointMedia';

  export default defineComponent({
    name: 'SpeakerButton',
    components: {
      TitleOption,
      PopUpWithButton,
      Button,
      Toggle,
    },
    props: {
      isAdmin: {
        type: Boolean,
        default: true,
      },
      hasVideo: {
        type: Boolean,
        default: true,
      },
      endpointId: {
        type: String,
        default: 'local',
      },
      listToggles: {
        type: Array,
        default: () => ['Technical Layout', 'Dont’t show this user to other'],
      },
    },
    setup(props) {
      const { t } = useI18n();
      const activeRemoteVideo = ref(true);

      const openFullScreen = () => {
        const videoElement = document.getElementById(props.endpointId);
        if (videoElement) videoElement.requestFullscreen();
      };

      const listMenuDefault = [
        // 'Click user',
        {
          icon: 'ic25-full-screen',
          title: t('speakerMenuList.fullScreen'),
          click: openFullScreen,
        },
      ];

      const listMenu = computed(() => {
        const activeList = [...listMenuDefault];
        if (props.endpointId !== 'local' && props.hasVideo)
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          activeList.push({
            icon: 'ic25-video-off',
            title: t('speakerMenuList.toggleRemoteVideoOff'),
            click: toggleRemoteVideo,
          });

        return activeList;
      });

      const toggleRemoteVideo = () => {
        activeRemoteVideo.value = !activeRemoteVideo.value;
        let menu = listMenu.value.find((item) => item.icon.includes('ic25-video'));
        if (menu) {
          let toggle = activeRemoteVideo.value ? 'Off' : 'On';
          menu.icon = 'ic25-video-' + toggle.toLowerCase();
          menu.title = t(`speakerMenuList.toggleRemoteVideo${toggle}`);
        }
        enableRemoteVideo({ endpointId: props.endpointId, active: activeRemoteVideo.value });
      };

      const listAllowUsers = [
        t('menuList.chat'),
        t('menuList.privateMessages'),
        t('menuList.rename'),
      ];

      return {
        t,
        listMenu,
        listAllowUsers,
        openFullScreen,
      };
    },
  });
</script>

<style scoped>
  .speaker-button {
    &::v-deep(.sui-button.sui-icon-only.sui-s).bnt-setting {
      padding: 0;
      border-radius: 0;
      &:hover {
        background-color: var(--sui-gray-900);
      }
      &:active {
        background-color: var(--sui-gray-900);
      }
      &:focus {
        box-shadow: none;
      }
    }
    &::v-deep(.popup-wrap) {
      min-width: 268px;
      left: 0;
    }
    &::v-deep(.sui-button.sui-l) {
      min-width: 100%;
      padding: 10px var(--pad16);
      justify-content: flex-start;
    }
    &::v-deep(.sui-button-content) {
      font-size: 14px;
      line-height: var(--pad20);
      font-weight: normal;
      color: var(--gray800);
    }
    & .wrap-setting {
      padding: var(--pad8) 0;
      &:not(:last-child) {
        box-shadow: inset 0 -1px 0 #ebedf2;
      }
    }
    & .toggle-option {
      justify-content: flex-start;
      padding: 10px var(--pad16);
      margin: 0;
    }
    &::v-deep(.switch--s) {
      margin-right: 12px;
    }
    & .title-setting {
      padding: 12px var(--pad16);
    }
  }
</style>
