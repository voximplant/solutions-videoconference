<template lang="pug">
.call-panel
  .panel-mobile(v-if="isMobileScreen")
    // SettingsButton.button(v-if="modes[mode] === modes.admin")
    SharingButton.icon(v-if="canScreen()")
    Button.icon(
      size='l'
      mode='outlined'
      :icon='{ spriteUrl: "/image/videoconf-icons.svg", name: iconMicName, color: "--sui-gray-700" }'
      :disabled="false"
      iconOnly
      @click="toggleAudio"
    )
    Button.icon(
      size='l'
      mode='outlined'
      :icon='{ spriteUrl: "/image/videoconf-icons.svg", name: iconCamName, color: "--sui-gray-700" }'
      :disabled="false"
      iconOnly
      @click="toggleVideo"
    )
    Button.icon(
      mode="alert"
      size="l"
      :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-leave-call-white'}"
      @click="leaveConference"
    )
    Button.icon(
      size='l'
      mode='flat'
      @click="handleOpenDrawer('settings')"
      :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-more', color: '--sui-gray-700' }"
      :disabled="false"
      iconOnly
    )
    // MeetingInfoWithPopup(:link="'videoconf.voximplant.com' + path" :name="params.conference")
    //Button.icon(
    //  mode="flat"
    //  size="l"
    //  :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-more'}"
    //  @click="openChat"
    //)
    // MenuButton
  .panel(v-else)
    .setting-wrap
      Tooltip.button(:text="t('buttons.info')")
        template(v-slot:button)
          MeetingInfoWithPopup(:link="'videoconf.voximplant.com' + path" :name="params.conference")
      // Tooltip.button(text="Admin settings")
        template(v-slot:button)
          SettingsButton(v-if="modes[mode] === modes.admin")
    .video-settings
      Tooltip.button(:text="sharingTooltip")
        template(v-slot:button)
          SharingButton(v-if="canScreen()" )
      AudioButton.btn-icon-chevron
      VideoButton.btn-icon-chevron
      Tooltip.button(:text="t('buttons.leave')")
        template(v-slot:button)
          Button(
            mode="alert"
            size="l"
            :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-leave-call-white'}"
            @click="leaveConference"
          )
    .user-settings
      Tooltip.button(:text="t('buttons.reactions')")
        template(v-slot:button)
          ReactionButton
      Tooltip.button(:text="t('buttons.users')")
        template(v-slot:button)
          // UsersButton
          Button(
            mode="flat"
            size="l"
            :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-users', color: contactListIconColor}"
            @click="handleOpenDrawer('contactList')"
            ref="button"
          )
      Tooltip.btn-icon-sq(:text="t('buttons.chat')")
        template(v-slot:button)
          Button(
            mode="flat"
            size="l"
            :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-chat', color: chatIconColor}"
            @click="handleOpenDrawer('chat')"
            ref="button"
          )
      Tooltip(:text="t('buttons.settings')")
        template(v-slot:button)
          MenuButton.btn-icon-sq
</template>

<script lang="ts">
  import { computed, defineComponent, PropType, ref } from 'vue';
  import { Icon, Button } from '@voximplant/spaceui';
  import { useIsMobileScreen } from '@/hooks/useIsMobile';
  import MeetingInfoWithPopup from '@/components/settings/MeetingInfoWithPopup.vue';
  import PopUpWithButton from '@/components/popups/PopUpWithButton.vue';
  import SettingsButton from '@/components/panel-buttons/SettingsButton.vue';
  import UsersButton from '@/components/panel-buttons/UsersButton.vue';
  import MenuButton from '@/components/panel-buttons/MenuButton.vue';
  import ReactionButton from '@/components/panel-buttons/ReactionButton.vue';
  import VideoButton from '@/components/panel-buttons/VideoButton.vue';
  import AudioButton from '@/components/panel-buttons/AudioButton.vue';
  import SharingButton from '@/components/panel-buttons/SharingButton.vue';
  import Tooltip from '@/components/info/Tooltip.vue';
  import RadioInput from '@/components/inputs/RadioInput.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { $drawer, closeDrawer, DrawerSection, openDrawer } from '@/store/drawer';
  import { useStore } from 'effector-vue/composition';
  import { endpointEventList } from '@/store/webrtc/endpointManager';
  import { $devices, toggleAudioEvent, toggleVideoEvent } from '@/store/devices/index';
  import { toggleMirrorAudioStream, toggleMirrorVideoStream } from '@/store/mirrorMedia/index';
  import { canScreen } from '@/helpers/vendor';
  import { useI18n } from 'vue-i18n';
  import { $sharing } from '@/store/sharing';

  interface PanelMode {
    default?: string;
    admin?: string;
  }

  const modes: PanelMode = {
    default: 'default',
    admin: 'admin',
  };

  export default defineComponent({
    name: 'CallButtonPanel',
    components: {
      Tooltip,
      SharingButton,
      AudioButton,
      VideoButton,
      ReactionButton,
      MenuButton,
      UsersButton,
      SettingsButton,
      PopUpWithButton,
      Icon,
      Button,
      MeetingInfoWithPopup,
      RadioInput,
    },
    // mode = admin - admin settings
    // mode = default - default settings
    props: {
      mode: {
        type: String as PropType<keyof PanelMode>,
        default: 'admin',
      },
      link: {
        type: String,
        default: '/image/videoconf-icons.svg',
        required: false,
      },
    },
    setup() {
      const { t } = useI18n();
      const { isMobileScreen } = useIsMobileScreen();
      const { path, params } = useRoute();
      const router = useRouter();
      const devices = useStore($devices);
      const button = ref<HTMLElement | null>(null);
      const drawerState = useStore($drawer);
      const toggleAudio = () => {
        toggleAudioEvent();
        toggleMirrorAudioStream();
      };
      const toggleVideo = () => {
        toggleVideoEvent();
        toggleMirrorVideoStream();
      };
      const sharingState = useStore($sharing);
      const sharingTooltip = computed(() =>
        sharingState.value.isSharing ? t('buttons.stopScreenShare') : t('buttons.screenShare')
      );

      const iconCamName = computed(() =>
        devices.value.videoEnabled ? 'ic25-video-on' : 'ic25-video-off'
      );

      const iconMicName = computed(() =>
        devices.value.audioEnabled ? 'ic25-mic-on' : 'ic25-mic-off'
      );

      const contactListIconColor = computed(() =>
        drawerState.value.opened && drawerState.value.section === 'contactList'
          ? '--sui-purple-500'
          : '--sui-gray-700'
      );
      const chatIconColor = computed(() =>
        drawerState.value.opened && drawerState.value.section === 'chat'
          ? '--sui-purple-500'
          : '--sui-gray-700'
      );

      const handleOpenDrawer = (section: DrawerSection) => {
        if (drawerState.value.opened && drawerState.value.section === section) {
          return closeDrawer();
        }

        openDrawer(section);
      };

      const leaveConference = () => {
        endpointEventList.clearAll();
        router.replace({
          name: 'Left',
        });
      };

      return {
        t,
        devices,
        isMobileScreen,
        path,
        params,
        modes,
        contactListIconColor,
        chatIconColor,
        button,
        handleOpenDrawer,
        leaveConference,
        iconMicName,
        iconCamName,
        toggleAudio,
        toggleVideo,
        sharingTooltip,
        canScreen,
      };
    },
  });
</script>

<style scoped>
  .call-panel {
    background-color: var(--white);
    @media (width <= 768px) {
      height: 75px;
      max-height: 75px;
    }
    & .panel-mobile {
      display: flex;
      justify-content: center;
      padding: var(--pad16) 11px;
      & .button,
      .icon {
        margin-left: var(--pad16);
        margin-right: var(--pad16);
      }
    }
    & .button {
      &:not(:last-child) {
        margin-right: var(--pad16);
      }
    }
    &::v-deep(.sui-button.chevron) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      padding: 12px 8px 13px 8px;
      border-left: var(--sui-white);
      &:focus {
        box-shadow: 0 0 0 0;
      }
    }
    &::v-deep(.sui-button) {
      border-radius: var(--pad8);
      & .icon-container {
        min-height: 25px;
        max-height: 25px;
        min-width: 25px;
        max-width: 25px;
        margin: 0;
      }
    }
    &::v-deep(.sui-button.sui-icon-only.sui-l) {
      padding: var(--pad8);
    }
    & .panel {
      height: 88px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-right: var(--pad24);
    }
    & .panel {
      &::v-deep(.sui-button) {
        &:not(:last-child) {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
      }
    }
    & .video-settings {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      margin: 0 var(--pad16);
    }
    & .user-settings {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
    }
    & .setting-wrap {
      display: flex;
      align-items: center;
    }
    & .btn-icon {
      padding: 8px 12px;
      border-radius: var(--pad8);
      &:not(:last-child) {
        margin-right: var(--pad16);
      }
    }
    & .btn-icon-sq {
      border-radius: var(--pad8);
      margin-right: var(--pad16);
    }
    .btn-icon-chevron {
      margin-right: var(--pad16);
    }
    & .icon-settings {
      margin-left: 12px;
      min-height: fit-content;
      min-width: fit-content;
    }
  }
</style>
