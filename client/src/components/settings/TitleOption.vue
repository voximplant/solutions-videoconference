<template lang="pug">
h2.title {{ title }}
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'TitleOption',
    components: {},
    props: {
      title: {
        type: String,
      },
    },
  });
</script>

<style scoped>
  .title {
    text-transform: uppercase;
    color: var(--gray500);
    font-weight: 500;
    font-size: 12px;
    line-height: var(--pad16);
  }
</style>
