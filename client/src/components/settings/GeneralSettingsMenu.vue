<template lang="pug">
.general-settings
  .close(@click="hiddenModal")
    Icon(
      name="ic16-close"
      color="--sui-gray-500"
    )
  .setting-wrap
    h1.title Settings
    ul.setting-list
      li(v-for="item in listSetting")
        RadioInput.setting-item(
          :item="item"
          name="settings"
          @click="currentTab = item"
          :key="item"
          :class="{ active: currentTab === item }"
          :checked="currentTab === item"
        )
  .content
    component(
      :is="currentTab" class="tab"
    )
</template>

<script lang="ts">
  import { defineComponent, PropType, ref } from 'vue';
  import { closeModal } from '@/store/modal';
  import RadioInput from '@/components/inputs/RadioInput.vue';
  import { Icon } from '@voximplant/spaceui';
  import Profile from '@/components/settings/Profile.vue';
  import Audio from '@/components/settings/Audio.vue';
  import Video from '@/components/settings/Video.vue';
  import Shortcuts from '@/components/settings/Shortcuts.vue';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'GeneralSettingsMenu',
    props: {
      currentTabProp: {
        type: Object as PropType<{ initTab: string }>,
      },
    },
    components: {
      Shortcuts,
      Video,
      Audio,
      Profile,
      RadioInput,
      Icon,
    },
    setup(props) {
      const currentTab = ref(props.currentTabProp?.initTab);
      const { t } = useI18n();
      const listSetting = ref([
        t('settings.profile'),
        t('settings.audio'),
        t('settings.video'),
        // t('settings.shortcuts'),
      ]);
      const hiddenModal = () => {
        closeModal();
      };
      return {
        hiddenModal,
        currentTab,
        listSetting,
      };
    },
  });
</script>

<style scoped>
  .general-settings {
    width: 571px;
    height: 383px;
    overflow: hidden;
    display: flex;
    & .close {
      position: absolute;
      right: var(--pad16);
      top: var(--pad24);
      width: var(--pad24);
      height: var(--pad24);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    & .title {
      font-weight: 500;
      font-size: 24px;
      line-height: 28px;
      color: var(--purple900);
      padding: var(--pad24) var(--pad32) var(--pad20);
    }
    & .setting-wrap {
      width: 184px;
      height: 100%;
      box-shadow: 1px 0 0 0 #ebedf2;
      overflow-y: auto;
    }
    & .setting-list {
      padding-bottom: var(--pad32);
    }
    &::v-deep(input:checked ~ .radio-input-wrap) {
      box-shadow: none;
      &::after {
        display: none;
      }
    }
    &::v-deep(.radio-input-wrap) {
      padding: 10px 12px 10px var(--pad32);
      font-size: 14px;
      line-height: 20px;
    }
    & .content {
      padding: var(--pad32) 52px var(--pad32) var(--pad32);
      overflow-y: auto;
      overflow-x: hidden;
      width: 387px;
    }
  }
</style>
