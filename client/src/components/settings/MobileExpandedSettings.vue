<template lang="pug">
.mobile-expanded-settings
  .header
    Button.back-btn(
      :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-shape'}"
      size="s"
      mode="flat"
      @click="openDrawer('settings')"
    ) {{ t('back') }}
    h2.title {{ t('menuList.generalSettings') }}
    Button.done-btn(
      size="s"
      mode="flat"
      @click="closeDrawer"
    ) {{ t('done') }}
  form.form-settings
    .form-wrap
      h2.subtitle {{ t('settings.audio') }}
      .microphone-wrap
        Select.select.microphone(
          :modelValue="devices.selectedAudioDevice"
          @update:modelValue='updateAudioDevice'
          :label="t('settings.profile')"
          :options="devices.audioDevices"
          :searchable="false"
          :placeholder="t('none')"
          :disabled="isAudioDisabled"
          id="microphone"
        )
        Sound

    .form-wrap
      h2.subtitle {{ t('settings.video') }}
      Select.select.camera(
        :modelValue="devices.selectedVideoDevice"
        @update:modelValue='updateVideoDevice'
        :label="t('settings.camera')"
        :options="devices.videoDevices"
        :searchable="false"
        :placeholder="t('none')"
        :disabled="!devices.requestDone || devices.videoDisabled"
      )
      Select.select.quality(
        :modelValue="devices.selectedQuality"
        @update:modelValue='updateVideoQuality'
        :label="t('settings.quality')"
        :options="devices.videoQuality"
        :searchable="false"
        :placeholder="t('none')"
        :disabled="!devices.requestDone || devices.videoDisabled"
      )
    .form-wrap
      h2.subtitle {{ t('settings.profile') }}
      .account-wrap
        SignInAccount.account(
          :userName="auth.displayName"
          :email="auth.email"
          :avatar="auth.picture"
          :isProfile="true"
        )
        //Button.icon(
        //  size="m"
        //  mode="flat"
        //  :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-edit-gray' }"
        //  :disabled="false"
        //  iconOnly
        //  @click="openDrawer"
        //)
      //Select.language(
      //  v-model:modelValue="activeLanguage"
      //  label="Language"
      //  :options="microphoneList"
      //  :searchable="false"
      //  placeholder="None"
      //  :disabled="isDisabled"
      //  )
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { Input, Select, Button } from '@voximplant/spaceui';
  import DownloadedFiles from '@/components/decorative-elements/DownloadedFiles.vue';
  import FileInput from '@/components/inputs/FileInput.vue';
  import ToggleWithText from '@/components/toggles/ToggleWithText.vue';
  import Sound from '@/components/decorative-elements/Sound.vue';
  import { openDrawer, closeDrawer } from '@/store/drawer';
  import SignInAccount from '@/components/accounts/SignInAccount.vue';
  import { useStore } from 'effector-vue/composition.cjs';
  import { $devices, setVideoQuality } from '@/store/devices/index';
  import { requestMirrorStream } from '@/store/mirrorMedia/index';
  import { authStore } from '@/store/auth';
  import { useI18n } from 'vue-i18n';
  import { VideoDeviceInfo } from '@/store/devices/VideoDeviceInfo';
  import { AudioDeviceInfo } from '@/store/devices/AudioDeviceInfo';
  const devices = useStore($devices);

  export default defineComponent({
    name: 'MobileExpandedSettings',
    components: {
      Input,
      Select,
      Button,
      DownloadedFiles,
      FileInput,
      Sound,
      SignInAccount,
      ToggleWithText,
    },
    props: {
      deviceError: {
        type: String,
        default: '',
        required: false,
      },
    },
    setup(props) {
      const { t } = useI18n();
      const auth = useStore(authStore);
      const updateVideoDevice = (e: VideoDeviceInfo) => {
        requestMirrorStream({
          selectedAudioDevice: $devices.getState().selectedAudioDevice,
          selectedVideoDevice: e,
        });
      };
      const updateVideoQuality = (e: Record<string, string>) => {
        setVideoQuality(e);
      };
      const updateAudioDevice = (e: AudioDeviceInfo) => {
        requestMirrorStream({
          selectedAudioDevice: e,
          selectedVideoDevice: $devices.getState().selectedVideoDevice,
        });
      };
      const isAudioDisabled = computed(
        () => !!props.deviceError && props.deviceError !== 'noCamera'
      );

      return {
        openDrawer,
        updateAudioDevice,
        auth,
        devices,
        closeDrawer,
        updateVideoDevice,
        updateVideoQuality,
        isAudioDisabled,
        t,
      };
    },
  });
</script>

<style scoped>
  .mobile-expanded-settings {
    font-family: var(--fontRoboto);
    width: 100%;
    padding-bottom: var(--pad24);
    & .header {
      display: flex;
      height: 44px;
      margin-top: 20px;
    }
    & .title {
      display: flex;
      justify-content: center;
      color: var(--gray800);
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      padding: 0 var(--pad16);
      margin: auto;
    }
    & .subtitle {
      color: var(--gray800);
      font-weight: 500;
      font-size: var(--pad24);
      line-height: 28px;
      margin-bottom: var(--pad16);
      padding: var(--pad24) 0;
    }
    & .select {
      margin-bottom: var(--pad24);
    }
    & .microphone,
    & .speaker {
      width: 100%;
      margin-right: var(--pad16);
    }
    &::v-deep(.sui-label) {
      font-size: var(--pad16);
      line-height: var(--pad20);
    }
    & .toggles {
      margin-bottom: var(--pad32);
    }
    & .toggle {
      padding: 12px var(--pad24);
    }
    & .form-wrap {
      width: 100%;
      padding: 0 var(--pad24);
    }
    & .microphone-wrap,
    & .speaker-wrap {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
    & .button-test {
      padding: 10px 18px 10px 19px;
      border-radius: var(--pad8);
    }
    & .account-wrap {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--pad24);
    }
    &::v-deep(.sui-select-head) {
      border-radius: var(--pad8);
      font-family: var(--fontRoboto);
      font-size: 14px;
      line-height: var(--pad20);
      padding: 9px 12px;
    }
    &::v-deep(.google-account) {
      justify-content: flex-start;
    }
    &::v-deep(.avatar) {
      margin-right: 16px;
    }
    &::v-deep(.name) {
      margin-bottom: 4px;
    }
    &::v-deep(.email) {
      color: var(--gray600);
    }
    & .done-btn {
      position: absolute;
      right: var(--pad16);
      top: var(--pad24);
    }
    & .back-btn {
      position: absolute;
      left: var(--pad16);
      top: var(--pad24);
      &::v-deep(.icon-container) {
        margin: 0;
      }
    }
  }
</style>
