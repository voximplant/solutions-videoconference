<template lang="pug">
.emoji-panel
  .emoji-wrap
    .emoji(v-for="(icon, type) in reactions.emojilist" :key="type" @click="animate(type)")
      span(:class="{animate:!!~animationTimeouts[type], color:reactions.localReactions[type]}") {{ icon }}
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Button } from '@voximplant/spaceui';
  import { useStore } from 'effector-vue/composition';
  import { reactionsStore, sendReaction } from '@/store/reactions';

  const ANIMATION_TIMEOUT = 600;

  export default defineComponent({
    name: 'EmojiPanel',
    components: {
      Button,
    },
    setup() {
      const animationTimeouts = ref<Record<string, number>>({});
      const reactions = useStore(reactionsStore);

      for (let name in reactions.value.emojilist) {
        animationTimeouts.value[name] = -1;
      }

      const animate = (type: string) => {
        if (animationTimeouts.value[type] !== -1) {
          clearTimeout(animationTimeouts.value[type]);
        }
        animationTimeouts.value[type] = setTimeout(() => {
          animationTimeouts.value[type] = -1;
        }, ANIMATION_TIMEOUT);

        const active = !reactions.value.localReactions[type];
        sendReaction({ type, active });
      };
      return {
        animate,
        animationTimeouts,
        reactions,
      };
    },
  });
</script>

<style scoped>
  .emoji-panel {
    background-color: var(--sui-gray-50);
    padding: 17px 0;
    border-radius: var(--pad16);
    @media (width >= 768px) {
      background-color: transparent;
      padding: 16px 20px;
    }

    & .emoji-wrap {
      min-width: 280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    & .emoji {
      font-size: 24px;
      cursor: pointer;
      padding: 6px;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      & span {
        filter: grayscale(100%);
        opacity: 1;
        transition: opacity 0.2s ease-in-out;
      }
      & .color {
        filter: grayscale(0%);
      }
      & .animate {
        filter: grayscale(0%);
        transform: scale(2.5);
        opacity: 0;
        transition: all 0.5s ease-in-out;
      }
      &:hover {
        background-color: var(--gray200);
      }
    }
  }
</style>
