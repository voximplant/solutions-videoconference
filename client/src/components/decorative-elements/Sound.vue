<template lang="pug">
.sound
  .point
  .point
  .point
  .point
  .point
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'Sound',
    components: {},
  });
</script>

<style scoped>
  .sound {
    padding: 18px 13px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    position: relative;

    :nth-child(1) {
      left: 0;
    }
    :nth-child(2) {
      left: 8px;
    }
    :nth-child(3) {
      left: 16px;
    }
    :nth-child(4) {
      left: 24px;
    }
    :nth-child(5) {
      left: 32px;
    }
    & .point {
      position: absolute;
      transition: 0.3s;
      width: 4px;
      height: 4px;
      min-height: 4px;
      max-height: 24px;
      border-radius: 10px;
      background-color: var(--purple500);
      margin-right: 4px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
</style>
