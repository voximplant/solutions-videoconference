<template lang="pug">
.toggle-panel
  h3.title Allow participant
  .toggle-mobile(v-if="isMobileScreen")
    ToggleWithText(
      v-for="item in listToggle"
      :title="item"
      :isDisabled="isDisabled"
    )
  .toggle-wrap(v-if="!isMobileScreen")
    Toggle.toggle-item(
      v-for="(item, key) in listToggle"
      :id="key"
      :text="item"
      :isDisabled="isDisabled"
      )
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import Toggle from '@/components/toggles/Toggle.vue';
  import ToggleWithText from '@/components/toggles/ToggleWithText.vue';
  import { useIsMobileScreen } from '@/hooks/useIsMobile';

  export default defineComponent({
    name: 'TogglePanel',
    components: {
      Toggle,
      ToggleWithText,
    },
    props: {
      listToggle: {
        type: Array,
        default: () => [
          'Chat',
          'Video',
          'Share screen',
          'Microphone',
          'Edit username',
          'Private massage',
        ],
      },
      isDisabled: {
        type: Boolean,
        default: false,
      },
    },
    setup() {
      const { isMobileScreen } = useIsMobileScreen();
      return {
        isMobileScreen,
      };
    },
  });
</script>

<style scoped>
  .toggle-panel {
    width: 100%;
    & .title {
      font-family: var(--fontRoboto);
      font-weight: 500;
      font-size: 14px;
      line-height: var(--pad16);
      color: var(--gray800);
      margin-bottom: var(--pad16);
    }
    & .toggle-wrap {
      display: grid;
      grid-template-columns: fit-content(100%) fit-content(100%);
      grid-template-rows: 1fr 1fr 1fr;
      justify-content: space-between;
    }
    & .toggle-item {
      margin-bottom: 12px;
    }
  }
</style>
