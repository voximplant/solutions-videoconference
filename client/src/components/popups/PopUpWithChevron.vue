<template lang="pug">
.popup
  transition(name="popup-wrap")
    .popup-wrap(v-if="isActive" ref="PopUpRef")
      .wrap
        slot(name="content")
  .button-with-chevron
    Tooltip(:text="tooltipBtn")
      template(v-slot:button)
        Button.icon(
          mode="outlined"
          size="l"
          :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: name, color: '--sui-gray-700', width: size, height: size}"
          icon-only
          :disabled="disabled"
          @click="toggleMedia"
        ) {{ title }}
    Tooltip.button(:text="tooltipChevron")
      template(v-slot:button)
        Button.chevron(mode="outlined" size="l" :class="{'active': isActive}" :disabled="disabled" @click="toggleClass" ref="PopUpButtonRef")
          .icon-chevron
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, onBeforeUnmount, ref } from 'vue';
  import { Button } from '@voximplant/spaceui';
  import { generateCheckClickOutside } from '@voximplant/spaceui';
  import Tooltip from '@/components/info/Tooltip.vue';
  import { togglePopup } from '@/store/popup';

  export default defineComponent({
    name: 'PopUpWithChevron',
    components: {
      Button,
      Tooltip,
    },
    props: {
      name: {
        type: String,
        default: 'ic25-settings',
        required: false,
      },
      size: {
        type: String,
        default: '25px',
        required: false,
      },
      title: {
        type: String,
        required: false,
      },
      tooltipBtn: {
        type: String,
        required: false,
      },
      tooltipChevron: {
        type: String,
        required: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:media'],
    setup(props, { emit }) {
      const isActive = ref(false);
      const PopUpRef = ref<HTMLElement | null>(null);
      const PopUpButtonRef = ref<HTMLElement | null>(null);
      const checkClickOutside = computed(() =>
        generateCheckClickOutside([PopUpRef, PopUpButtonRef])
      );
      const onClickOutside = (e: MouseEvent) => {
        if (checkClickOutside.value(e)) {
          isActive.value = false;
          togglePopup(isActive.value);
        }
      };

      const toggleClass = () => {
        isActive.value = !isActive.value;
        togglePopup(isActive.value);
      };

      const toggleMedia = () => {
        emit('update:media');
      };

      const onKeyDownEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          isActive.value = false;
        }
      };

      onMounted(() => {
        document.addEventListener('click', onClickOutside, { capture: true });
        document.addEventListener('keydown', onKeyDownEsc);
      });
      onBeforeUnmount(() => {
        document.removeEventListener('click', onClickOutside, {
          capture: true,
        });
        document.removeEventListener('keydown', onKeyDownEsc);
      });

      return {
        isActive,
        toggleClass,
        toggleMedia,
        PopUpRef,
        PopUpButtonRef,
      };
    },
  });
</script>

<style scoped>
  .popup {
    position: relative;
    & .popup-wrap {
      background-color: var(--white);
      font-family: var(--fontRoboto);
      width: fit-content;
      min-height: fit-content;
      max-height: calc(100vh - 90px);
      position: absolute;
      overflow: hidden;
      border: 1px solid #e3e4eb;
      box-shadow: 0 2px 8px rgba(40, 41, 61, 0.04), 0 16px 24px rgba(96, 97, 112, 0.16);
      border-radius: 12px;
      bottom: calc(100% + 4px);
      left: var(--pad16);
      z-index: 1;
    }
    & .wrap {
      width: 100%;
      height: 100%;
    }
    .button-with-chevron {
      display: flex;
    }
    &::v-deep(.sui-button) {
      background: transparent;
      &:focus:not(.active) {
        background: transparent;
      }
    }
    &::v-deep(.sui-button.sui-icon-only).icon {
      padding-right: 41px;
      height: 100%;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      padding-left: 12px;
      position: relative;
      overflow: hidden;
    }
    &::v-deep(.sui-button) {
      border-bottom-left-radius: 0;
    }
    & .icon-chevron {
      width: 16px;
      height: 16px;
      background: url('../../assets/images/icon/ic16-chevron-down-small-gray.svg');
      transition: all 0.5s ease-in;
    }
    & .active {
      background: var(--gray200);
      transition: background 0.3s ease-in;
    }
    & .active .icon-chevron {
      transform: rotate(180deg);
      filter: hue-rotate(10deg) saturate(40) contrast(1.6);
      transition: all 0.3s ease-in;
    }
  }
  .popup-wrap-enter-to,
  .popup-wrap-leave-from {
    opacity: 1;
  }
  .popup-wrap-leave-to,
  .popup-wrap-enter-from {
    opacity: 0;
  }
  .popup-wrap-enter-active,
  .popup-wrap-leave-active {
    transition: opacity 0.2s;
  }
  .popup-wrap-enter-active,
  .popup-wrap-leave-active {
    transition: opacity 0.2s;
  }
  .popup-wrap-enter-active,
  .popup-wrap-leave-active {
    transition: opacity 0.2s;
  }
  .popup-wrap-enter-active,
  .popup-wrap-leave-active {
    transition: opacity 0.2s;
  }
</style>
