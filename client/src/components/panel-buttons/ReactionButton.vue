<template lang="pug">
.reaction-button
  PopUpWithButton.reaction(name="ic25-hand" size="25px")
    template(v-slot:content)
      EmojiPanel.emoji
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import PopUpWithButton from '@/components/popups/PopUpWithButton.vue';
  import EmojiPanel from '@/components/chat/EmojiPanel.vue';

  export default defineComponent({
    name: 'ReactionButton',
    components: {
      EmojiPanel,
      PopUpWithButton,
    },
  });
</script>

<style scoped>
  .reaction-button {
    &::v-deep(.popup-wrap) {
      left: auto;
      transform: translateX(calc(50% - 100%));
    }
    & .emoji {
      width: 400px;
    }
  }
</style>
