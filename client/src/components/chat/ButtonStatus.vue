<template lang="pug">
.button-status
  Tooltip(:text="t('chat.privateDescription')")
    template(v-slot:button)
      Button.btn(
        mode="primary"
        size="m"
      ) {{ t('chat.privateBtn') }}

</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Button } from '@voximplant/spaceui';
  import Tooltip from '@/components/info/Tooltip.vue';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'ButtonStatus',
    components: {
      Tooltip,
      Button,
    },
    setup() {
      const { t } = useI18n();
      return {
        t,
      };
    },
  });
</script>

<style scoped>
  .button-status {
    font-family: var(--fontRoboto);
    & .btn {
      border-radius: 10px;
      padding: 2px 4px;
      display: inline-block;
      @media (width >= 768px) {
        padding: 0 4px;
      }
    }
    &::v-deep(.sui-m) {
      min-height: fit-content;
      min-width: fit-content;
    }
    &::v-deep(.sui-button-content) {
      display: block;
      font-weight: normal;
      font-size: 12px;
      line-height: var(--pad16);
      @media (width >= 768px) {
        font-size: 10px;
      }
    }
  }
</style>
