<template lang="pug">
.sharing-button
  Button.sharing_border(
    v-if="sharingState.isSharing"
    size='l'
    mode='flat'
    iconOnly
    :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-sharing-on', color: '--sui-gray-700', width: '25px', height: '25px'}"
    @click="toggleScreenSharing('none')"
  )
  PopUpWithButton.sharing(v-else name="ic25-sharing-off" size="25px" buttonMode="secondary")
    template(v-slot:content)
      .wrap-button
        Button.item(
          v-for="item in sharingButtons"
          mode="flat"
          size="l"
          @click="toggleScreenSharing(item.type)"
          :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: item.icon, color: '--sui-gray-700', width: '25px', height: '25px'}"
        ) {{ item.title }}
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Button } from '@voximplant/spaceui';
  import PopUpWithButton from '@/components/popups/PopUpWithButton.vue';
  import { $sharing } from '@/store/webrtc/endpoints';
  import { endpointEventList } from '@/store/webrtc/endpointManager';
  import { SharingType } from '@/store/sharing';
  import { useStore } from 'effector-vue/composition.cjs';
  import { Vendor, userAgent } from '@/helpers/vendor';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'SharingButton',
    components: {
      PopUpWithButton,
      Button,
    },
    setup() {
      const { t } = useI18n();
      const listSharing = [
        {
          icon: 'ic25-sharing',
          title: t('buttons.sharingButtons.withVideo'),
          type: 'withVideo',
        },
        {
          icon: 'ic25-screen',
          title: t('buttons.sharingButtons.replace'),
          type: 'replace',
        },
      ];
      const sharingState = useStore($sharing);
      const sharingButtons =
        userAgent === Vendor?.chrome
          ? [
              {
                icon: 'ic25-sharing',
                title: t('buttons.sharingButtons.withVideoAndAudio'),
                type: 'withVideoAndAudio',
              },
              ...listSharing,
            ]
          : listSharing;
      const toggleScreenSharing = (type: SharingType) => {
        if (!$sharing.getState().isSharing) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          endpointEventList.addSharing(type);
        } else {
          endpointEventList.removeSharing();
        }
      };

      return {
        toggleScreenSharing,
        sharingState,
        sharingButtons,
      };
    },
  });
</script>

<style scoped>
  .sharing_border {
    padding: var(--pad8) 12px;
    border: 1px solid var(--sui-gray-300);
    height: 41px;
  }
  .sharing-button {
    & .wrap-button {
      width: 100%;
      padding: var(--pad8) 0;
    }
    & .sharing::v-deep(.sui-button.sui-icon-only.sui-l) {
      padding: var(--pad8) 12px;
      background-color: #f7f7f7;
      border: 1px solid var(--sui-gray-300);
      height: 41px;
    }
    &::v-deep(.popup-wrap) {
      min-width: 262px;
      left: auto;
      right: 0;
    }
    &::v-deep(.sui-button.sui-l).item {
      padding: 10px var(--pad16);
      min-width: 100%;
      border-radius: 0;
      justify-content: stretch;
      margin-right: 0;
    }
    & .item::v-deep(.sui-button-content) {
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      color: var(--gray900);
      margin-left: 12px;
    }
  }
</style>
