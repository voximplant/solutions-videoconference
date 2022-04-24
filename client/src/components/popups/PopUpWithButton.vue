<template lang="pug">
.popup
  transition(name="popup-wrap")
    .popup-wrap(v-if="isActive" ref="PopUpRef")
      .wrap
        slot(name="content" :toggleDropdown="toggleClass")
  .button(@click="toggleClass" ref="PopUpButtonRef")
    slot(name="button")
    Button.icon(
      v-if="isDefaultButton"
      :mode="buttonMode"
      size="l"
      :icon="iconProps"
      icon-only
    )
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, onBeforeUnmount, ref, Ref } from 'vue';
  import { Button } from '@voximplant/spaceui';
  import { generateCheckClickOutside } from '@voximplant/spaceui';
  import { togglePopup } from '@/store/popup';

  export default defineComponent({
    name: 'PopUpWithButton',
    components: {
      Button,
    },
    props: {
      name: {
        type: String,
        default: 'ic25-settings',
      },
      size: {
        type: String,
        default: '25px',
      },
      isDefaultButton: {
        type: Boolean,
        default: true,
      },
    },
    setup(props) {
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

      const { buttonMode } = useButtonMode(isActive);
      const { iconProps } = useIconProps(isActive, props.name, props.size);

      return {
        isActive,
        toggleClass,
        PopUpRef,
        PopUpButtonRef,
        buttonMode,
        iconProps,
      };
    },
  });
  function useButtonMode(isActive: Ref<boolean>) {
    const buttonMode = computed(() => (isActive.value ? 'secondary' : 'flat'));
    return { buttonMode };
  }
  function useIconProps(isActive: Ref<boolean>, name: string, size: string) {
    const iconColor = computed(() => (isActive.value ? '--sui-purple-500' : '--sui-gray-700'));
    const iconProps = computed(() => ({
      spriteUrl: '/image/videoconf-icons.svg',
      name: name,
      color: iconColor.value,
      width: size,
      height: size,
    }));

    return { iconProps };
  }
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
