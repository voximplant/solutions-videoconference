import { computed, onMounted, onBeforeUnmount, ref, Ref } from 'vue';
import { generateCheckClickOutside } from '@voximplant/spaceui';

export function activateIcons(): {
  toggleClass: () => void;
  changeMode: () => void;
  changeColor: () => void;
  isActive: Readonly<Ref<boolean>>;
  PopUpRef: Readonly<Ref<HTMLElement | null>>;
  PopUpButtonRef: Readonly<Ref<HTMLElement | null>>;
} {
  const isActive = ref(false);
  const PopUpRef = ref<HTMLElement | null>(null);
  const PopUpButtonRef = ref<HTMLElement | null>(null);
  const checkClickOutside = computed(() => generateCheckClickOutside([PopUpRef, PopUpButtonRef]));
  const onClickOutside = (e: MouseEvent) => {
    if (checkClickOutside.value(e)) {
      isActive.value = false;
    }
  };

  const toggleClass = () => {
    isActive.value = !isActive.value;
  };

  const changeMode = () => {
    let mode = '';
    mode = isActive.value ? 'flat' : 'secondary';
    return mode;
  };

  const changeColor = () => {
    return isActive.value ? '--sui-gray-700' : '--sui-purple-500';
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
    PopUpRef,
    PopUpButtonRef,
    changeMode,
    changeColor,
  };
}
