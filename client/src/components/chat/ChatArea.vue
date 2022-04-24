<template lang="pug">
.chat-area
  .header(v-if="isMobileScreen" )
    Button.back-btn(
      :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-shape'}"
      size="s"
      mode="flat"
      @click="openDrawer('settings')"
      ) {{ t('back') }}
    h2.title {{ t('menuList.chat') }}
  .panel
  .empty-wrap(v-if="!chatList.length")
    img.background-image(:src="require('../../assets/images/no-messages-files-background.png')")
    p.background-text {{ t('chat.noMessage') }}
  .messages-wrap(v-else)
    Message(
      v-for="item of chatList"
      :name="item.name"
      :time="item.time"
      :avatar="item.avatar"
      :message="item.message"
      :isPrivate="false"
    )
  TextArea
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import TextArea from '@/components/chat/TextArea.vue';
  import { openDrawer } from '@/store/drawer';
  import { $chatContent } from '@/store/chat/index';
  import { Button } from '@voximplant/spaceui';
  import Message from '@/components/chat/Message.vue';
  import { useIsMobileScreen } from '@/hooks/useIsMobile';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'ChatArea',
    components: {
      Message,
      TextArea,
      Button,
    },
    props: {
      chatList: {
        type: Array,
        default: () => [],
      },
    },
    setup() {
      const { t } = useI18n();
      const { isMobileScreen } = useIsMobileScreen();
      return {
        openDrawer,
        chatContent: $chatContent,
        isMobileScreen,
        t,
      };
    },
  });
</script>

<style scoped>
  .chat-area {
    display: flex;
    flex-direction: column;
    font-family: var(--fontRoboto);
    justify-content: flex-end;
    @media (width >= 768px) {
      height: calc(100vh - 62px);
      width: 340px;
    }
    @media (width < 768px) {
      height: 100vh;
      width: 100%;
    }

    & .header {
      display: flex;
      height: 44px;
      min-height: 44px;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: center;
      & .back-btn {
        position: absolute;
        top: 6px;
        left: 12px;
        &::v-deep(.icon-container) {
          margin: 0;
        }
      }
    }
    & .title {
      color: var(--gray800);
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      padding: 0 var(--pad16);
      margin: auto;
    }
    & .panel {
      height: 44px;
      width: 100%;
    }
    & .empty-wrap {
      margin: auto;
      width: fit-content;
    }
    & .background-image {
      height: 134px;
      margin-bottom: var(--pad8);
      width: 134px;
    }
    & .background-text {
      color: var(--gray500);
      font-size: var(--pad16);
      line-height: var(--pad20);
      text-align: center;
    }
    & .messages-wrap {
      align-items: flex-end;
      display: grid;
      grid-gap: var(--pad24);
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
      height: 100%;
      margin-bottom: 36px;
      overflow-x: hidden;
      overflow-y: auto;
      padding: var(--pad40) var(--pad16) 0;
      width: 100%;
    }
  }
</style>
