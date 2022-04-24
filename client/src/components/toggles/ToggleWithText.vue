<template lang="pug">
.toggle-with-text
  .title-wrap
    p.toggle-title {{ title }}
    p.toggle-description(v-if="description") {{ description }}
  Toggle(size="size-m")
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import Toggle from '@/components/toggles/Toggle.vue';

  export default defineComponent({
    name: 'ToggleWithText',
    components: {
      Toggle,
    },
    props: {
      title: {
        type: String,
      },
      description: {
        type: String,
        default: '',
      },
    },
  });
</script>

<style scoped>
  .toggle-with-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    box-shadow: inset 0 -1px 0 #ebedf2;
    & .toggle-title {
      color: var(--gray800);
      font-size: 16px;
      line-height: 20px;
      @media (width >= 768px) {
        font-size: 14px;
      }
    }
    & .toggle-description {
      font-size: 14px;
      line-height: 20px;
      color: var(--gray600);
      @media (width >= 768px) {
        font-size: 12px;
      }
    }
  }
</style>
