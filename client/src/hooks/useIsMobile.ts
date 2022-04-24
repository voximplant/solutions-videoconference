import { userAgent, Vendor } from '@/helpers/vendor';
import { onBeforeUnmount, onMounted, readonly, Ref, ref } from 'vue';

function useIsMobileScreen(): { isMobileScreen: Readonly<Ref<boolean>> } {
  const isMobile = ref(false);

  const onWindowResize = () => {
    isMobile.value = window.innerWidth < 768;
  };

  onMounted(() => {
    onWindowResize();
    window.addEventListener('resize', onWindowResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize);
  });

  return {
    isMobileScreen: readonly(isMobile),
  };
}

function useIsMobilePlatform(): { isMobilePlatform: boolean } {
  const isMobilePlatform = userAgent === Vendor.mobile || userAgent === Vendor.tablet;

  return {
    isMobilePlatform,
  };
}

export { useIsMobileScreen, useIsMobilePlatform };
