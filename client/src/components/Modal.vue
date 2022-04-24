<template lang="pug">
teleport(to="body" v-if="content.opened")
  .modal
    .hidden(@click="close")
    .window
      component(:is="content.component" v-bind="content.componentOptions")
      slot(:initTab="content.componentOptions?.initTab")
</template>

<script lang="ts">
  import { isModalOpened, closeModal } from '@/store/modal';
  import { defineComponent } from 'vue';
  import { useStore } from 'effector-vue/composition';
  import InvitePeople from './InvitePeople.vue';

  export default defineComponent({
    components: { InvitePeople },
    setup() {
      const content = useStore(isModalOpened);
      return {
        content,
        close: () => {
          closeModal();
        },
      };
    },
  });
</script>

<style scoped>
  .modal {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    & .hidden {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--gray900);
      opacity: 0.4;
    }
    & .window {
      position: absolute;
      width: fit-content;
      height: fit-content;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      background: #ffffff;
      box-shadow: 0 2px 4px rgba(40, 41, 61, 0.04), 0 8px 16px rgba(96, 97, 112, 0.16);
      border-radius: 12px;
      box-sizing: border-box;
    }
  }
</style>
