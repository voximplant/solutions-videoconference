<template lang="pug">
.backspace(v-if="drawerStore.opened")
transition(name="drawer" v-if="isMobileScreen || drawerStore.section === 'changeLayout'" )
  .drawer(v-if="drawerStore.opened" ref="PopUpRef" :style="{ maxHeight }")
    .wrap
      .title(v-if="title") {{ title }}
      .close(@click="closeDrawer" v-if="!isMobileScreen")
      slot
transition(name="drawer" v-else)
  .drawer(v-if="drawerStore.opened" ref="PopUpRef" :style="{ maxHeight }")
      .wrap
        TabsGroup.header(
          v-model:activeTab="activeTab"
          @update:activeTab="changeSection"
          :tabs="tabs"
        )
        .title(v-if="title") {{ title }}
        .close(@click="closeDrawer")
        slot
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    onUnmounted,
    ref,
    watch,
  } from 'vue';
  import { Button, TabsGroup } from '@voximplant/spaceui';
  import { closeDrawer, $drawer, openDrawer } from '@/store/drawer';
  import { useStore } from 'effector-vue/composition';
  import { $users } from '@/store/users';
  import { useI18n } from 'vue-i18n';
  import { useIsMobileScreen } from '@/hooks/useIsMobile';

  export default defineComponent({
    name: 'Drawer',
    props: {
      title: {
        type: String,
      },
      maxHeight: {
        type: String,
        default: '100%',
      },
    },
    components: {
      Button,
      TabsGroup,
    },
    setup() {
      const { t } = useI18n();
      const drawerStore = useStore($drawer);
      const users = useStore($users);
      const { isMobileScreen } = useIsMobileScreen();
      // +1 is the local user
      const usersCount = computed(() => users.value.users?.length + 1);
      const tabs = computed(() => [
        { title: t('buttons.chat'), type: 'chat' as const },
        { title: t('buttons.users'), type: 'contactList' as const, badge: usersCount },
      ]);
      const activeTab = ref(0);
      const activeSection = computed(() => tabs.value[activeTab.value].type);

      watch(
        () => drawerStore.value.section,
        (section) => {
          activeTab.value = section === 'contactList' ? 1 : 0;
        }
      );

      const changeSection = () => {
        if (activeSection.value !== drawerStore.value.section) {
          openDrawer(activeSection.value);
        }
      };

      const PopUpRef = ref<HTMLElement | null>(null);

      const onKeyDownEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeDrawer();
        }
      };

      onMounted(() => {
        document.addEventListener('keydown', onKeyDownEsc);
      });
      onBeforeUnmount(() => {
        document.removeEventListener('keydown', onKeyDownEsc);
      });

      return {
        tabs,
        drawerStore,
        closeDrawer,
        isMobileScreen,
        PopUpRef,
        activeTab,
        changeSection,
      };
    },
  });
</script>

<style scoped>
  .drawer {
    position: absolute;
    width: 100%;
    bottom: 0;
    background: #ffffff;
    box-shadow: 0 -2px 4px rgba(40, 41, 61, 0.04), 0 -8px 16px rgba(96, 97, 112, 0.16);
    border-radius: 16px 16px 0 0;
    overflow: hidden;
    overflow-y: auto;
    z-index: 2;
    @media (width >= 768px) {
      overflow: auto;
      padding: 0;
      position: relative;
      height: 100%;
      width: 340px;
      min-width: 340px;
      border-radius: 0;
      right: 0;
      top: 0;
      background: #ffffff;
      box-shadow: -1px 0 10px #ebedf2;
      overflow-x: hidden;
    }
    & .wrap {
      width: 100%;
      @media (width >= 768px) {
        width: auto;
        height: 100%;
        padding: 16px 0 16px 0;
        right: 0;
        top: 0;
      }
    }
    & .title {
      font-size: 20px;
      margin-bottom: 16px;
    }
    & .close {
      cursor: pointer;
      position: absolute;
      width: 24px;
      height: 24px;
      right: 6px;
      top: 14px;
      background-image: url('../assets/close.svg');
      background-repeat: no-repeat;
      background-position: center;
      z-index: 1;
    }
    & .header {
      border: 1px solid var(--sui-gray-200);
      &::v-deep(.sui-scroll-button-container) {
        display: none;
      }
    }
  }
  .backspace {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    opacity: 0.4;
    @media (width > 768px) {
      display: none;
    }
  }
  .drawer-enter-to,
  .drawer-leave-from {
    width: 100%;
    @media (width >= 768px) {
      width: 340px;
      min-width: 340px;
      height: 100%;
    }
  }
  .drawer-leave-to,
  .drawer-enter-from {
    transform: translateY(100%);
    width: 100%;
    @media (width >= 768px) {
      height: 100%;
      width: 0;
      min-width: 0;
    }
  }
  .drawer-enter-active,
  .drawer-leave-active {
    height: auto;
    transition: transform 0.5s;
    @media (width >= 768px) {
      transition: min-width 0.5s, width 0.5s;
    }
  }
</style>
