<template lang="pug">
.text-area
  .button-wrap(v-if="false")
    .icons
      Button.icon.emotion(
        v-if="!isMobileScreen"
        mode="flat"
        size="l"
        :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic24-icon-emotion', color: '--sui-gray-600'}"
        icon-only
      )
      Button.icon.attachment( 
        mode="flat"
        size="l"
        :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-attachment-gray'}"
        icon-only
      )
    Button.button(
      v-if="!isSelected"
      @click="sendMessage"
      mode="flat"
      size="l"
      icon="ic12-arrow-down"
    ) Send to: All
    Button.button(
      v-else
      mode="primary"
      size="l"
      :icon="{ name: 'ic12-arrow-up', height: '12px', width: '12px'}"
    ) Send to: {{' '}}
      span {{ selectedUsers }}
  .text-wrap
    .text-input
      textarea.message(name="chat" :placeholder="t('chat.placeholder')" v-model="message" ref="textArea" @keydown="onKeyDown")
    Button.icon.send(
      @click="sendMessage"
      size="l"
      mode="flat"
      :icon="iconProps"
      icon-only
    )
  // p.typing(v-if="typing.length") {{ userTyping }} is typing ...
</template>

<script lang="ts">
  import { defineComponent, ref, computed, watch, Ref } from 'vue';
  import { Button, Input } from '@voximplant/spaceui';
  import { useIsMobileScreen } from '@/hooks/useIsMobile';
  import { sendMessageToAll } from '@/store/chat/index';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'TextArea',
    components: {
      Button,
      Input,
    },
    props: {
      typing: {
        type: Array,
        default: () => [],
      },
      iconColor: {
        type: String,
      },
      // isSelected - a initial state of the button or a user is selected
      isSelected: {
        type: Boolean,
        default: false,
      },
      users: {
        type: Array,
        default: () => [],
      },
    },
    setup(props) {
      const { t } = useI18n();
      const message = ref('');
      const isActive = computed(() => Boolean(message.value.length));
      const { textArea } = useGrowInput(message);
      const { iconProps } = useIconProps(isActive);
      const { isMobileScreen } = useIsMobileScreen();
      const selectedUsers = props.users.join(', ');
      const userTyping = props.typing.join(', ');

      const sendMessage = () => {
        sendMessageToAll({ text: message.value });
        message.value = '';
      };

      const onKeyDown = (ev: KeyboardEvent) => {
        if (ev.shiftKey && ev.key === 'Enter') {
          ev.preventDefault();
          ev.cancelBubble = true;
          sendMessage();
        }
      };

      return {
        t,
        textArea,
        message,
        isActive,
        iconProps,
        isMobileScreen,
        selectedUsers,
        userTyping,
        onKeyDown,
        sendMessage,
      };
    },
  });

  function useIconProps(isActive: Ref<boolean>) {
    const iconColor = computed(() => (isActive.value ? '--sui-purple-500' : '--sui-gray-600'));
    const iconProps = computed(() => ({
      spriteUrl: '/image/videoconf-icons.svg',
      name: `ic25-icon-send`,
      color: iconColor.value,
    }));

    return { iconProps };
  }

  function useGrowInput(message: Ref<string>) {
    const textArea = ref<HTMLTextAreaElement | null>(null);

    const autoGrow = (message: string) => {
      if (!textArea.value) return;

      if (message.length) {
        textArea.value.style.height = '25px';
        textArea.value.style.height = textArea.value.scrollHeight + 'px';
      } else {
        textArea.value.style.height = '25px';
      }
    };
    watch(message, autoGrow);

    return {
      textArea,
    };
  }
</script>

<style scoped>
  .text-area {
    display: flex;
    font-family: var(--fontRoboto);
    width: 100%;
    min-height: 88px;
    box-shadow: inset 0 1px 0 #ebedf2;
    position: relative;
    @media (width >= 768px) {
      padding: var(--pad16);
    }
    @media (width <= 768px) {
      min-height: 60px;
    }
    & .button-wrap {
      display: flex;
      align-items: center;
      @media (width >= 768px) {
        margin-bottom: 12px;
        justify-content: space-between;
      }
    }
    & .icon {
      padding: 10px;
      margin-right: 4px;
      @media (width >= 768px) {
        padding: 0;
        margin-right: 0;
      }
    }
    & .send {
      margin-right: 0;
    }
    &::v-deep(.icon-container) {
      position: static;
      width: fit-content;
      order: 1;
      @media (width >= 768px) {
      }
    }
    &::v-deep(.sui-button-content) {
      font-weight: normal;
      display: flex;
      @media (width >= 768px) {
        font-size: 10px;
        line-height: 16px;
      }
    }
    & .button {
      padding: 0 var(--pad8);
      border: 1px solid var(--sui-purple-500);
      border-radius: 12px;
      justify-content: space-between;
      position: relative;
      max-width: 100%;
      @media (width >= 768px) {
        order: 0;
        max-width: 200px;
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
      & .text {
        justify-content: flex-start;
        text-overflow: ellipsis;
        height: 20px;
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
      }
    }

    &::v-deep(.sui-button.sui-icon-only.sui-l) {
      padding: 10px;
      @media (width >= 768px) {
        padding: 3px;
      }
    }
    & .icons {
      display: flex;
      align-items: center;
      @media (width >= 768px) {
        order: 1;
        height: 25px;
      }
    }
    & .attachment {
      @media (width >= 768px) {
        margin-right: 0;
      }
    }

    & .emotion {
      margin-right: 12px;
    }
    & .text-input {
      width: 100%;
      display: inline-block;
      margin-right: 4px;
      @media (width >= 768px) {
        margin-right: 0;
      }
      @media (width <= 768px) {
        margin-bottom: 16px;
      }
    }
    & .message {
      width: 100%;
      border: none;
      border-bottom: 1px solid var(--gray500);
      min-height: 25px;
      height: 25px;
      max-height: 141px;
      border-radius: 0;
      resize: none;
      background-color: transparent;
      outline: none;
      color: var(--gray900);
      font-size: 16px;
      line-height: 20px;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-y: auto;
      @media (width >= 768px) {
        max-height: 308px;
      }
      &::placeholder {
        color: var(--gray600);
        font-size: var(--pad16);
        line-height: var(--pad20);
        @media (width >= 768px) {
          font-size: 14px;
        }
      }
      &:focus {
        border-color: var(--purple500);
      }
    }
    & .text-wrap {
      display: flex;
      align-items: flex-end;
      padding: 0 8px 4px;
      margin: auto;
      width: 100%;
      height: 100%;
      overflow: hidden;
      @media (width >= 768px) {
        padding: 0;
      }
      @media (width <= 768px) {
        padding: 0 16px 4px 16px;
      }
    }
    & .typing {
      position: absolute;
      color: var(--gray500);
      font-size: 12px;
      line-height: 16px;
      bottom: calc(100% + 8px);
      left: 16px;
    }
  }
</style>
