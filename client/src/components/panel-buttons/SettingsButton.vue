<template lang="pug">
.setting-button
    PopUpWithButton(name="ic25-settings" size="25px")
      template(v-slot:content)
        .content-wrap
          TitleOption.title-option(:title="t('settings.option')")
          Toggle.toggle-option(
            v-for="toggle in toggles"
            :label="toggle"
            :isLabelFirst="false"
            size="s"
            :modelValue="true" 
          )
        .additionally-option
          Toggle.toggle-option.last(
            :label="t('settings.technical')"
            :isLabelFirst="false"
            size="s"
          )
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Button, Toggle } from '@voximplant/spaceui';
  import TitleOption from '@/components/settings/TitleOption.vue';
  import PopUpWithButton from '@/components/popups/PopUpWithButton.vue';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'SettingsButton',
    components: {
      PopUpWithButton,
      TitleOption,
      Button,
      Toggle,
    },
    setup() {
      const { t } = useI18n();
      const toggles = [t('menuList.chat'), t('menuList.privateMessages'), t('menuList.rename')];
      return {
        t,
        toggles,
      };
    },
  });
</script>

<style scoped>
  .setting-button {
    & .content-wrap {
      padding: var(--pad20) var(--pad16) 0;
    }
    & .title-option {
      margin-bottom: var(--pad24);
    }
    & .toggle-option {
      justify-content: flex-start;
      align-items: center;
      width: max-content;
    }
    &::v-deep(.switch) {
      margin-right: 12px;
    }
    & .additionally-option {
      box-shadow: inset 0 1px 0 var(--gray300);
      padding: 18px var(--pad16);
    }
    & .last {
      margin-bottom: 0;
    }
  }
</style>
