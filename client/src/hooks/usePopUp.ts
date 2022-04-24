import { ref, Ref } from 'vue';

export function usePopUp(): {
  openModal: () => void;
  isOpen: Readonly<Ref<boolean>>;
  element: Readonly<Ref<HTMLElement | null>>;
} {
  const isOpen = ref(false);
  const element = ref<HTMLElement | null>(null);
  const openModal = () => {
    isOpen.value = !isOpen.value;
    if (!element.value) return;
    if (isOpen.value === true) element.value.classList.add('active');
    else element.value.classList.remove('active');
    console.log(element.value);
  };

  return {
    element,
    openModal,
    isOpen,
  };
}
