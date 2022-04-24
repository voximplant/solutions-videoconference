import { onBeforeUnmount, onMounted, ref, readonly, Ref } from 'vue';

export function useLogoSize(): { logoSize: Readonly<Ref<string>> } {
  const logoSize = ref('');
  const onLogoResize = () => {
    if (window.innerWidth < 768) {
      logoSize.value = 'small';
    } else {
      logoSize.value = 'large';
    }
  };

  onMounted(() => {
    onLogoResize();
    window.addEventListener('resize', onLogoResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onLogoResize);
  });

  return {
    logoSize: readonly(logoSize),
  };
}
