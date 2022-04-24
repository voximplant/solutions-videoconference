<template lang="pug">
.reactions
  .emoji-panel
    .emoji-wrap
      .emoji(v-for="emoji in userReactions" :key="emoji")
        span {{ reactions.emojilist[emoji] }}
</template>

<script>
  import { useStore } from 'effector-vue/composition';
  import { reactionsStore } from '@/store/reactions';
  import { $endpoints } from '@/store/webrtc/endpoints';
  import { computed, watch } from 'vue';

  export default {
    name: 'MediaSlotReactions',

    props: {
      endpointId: {
        type: String,
      },
    },

    setup(props) {
      const reactions = useStore(reactionsStore);
      let userReactions;

      if (props.endpointId === 'local') {
        userReactions = computed(() =>
          Object.keys(reactions.value.localReactions).filter(
            (type) => reactions.value.localReactions[type]
          )
        );
      } else {
        const endpoints = useStore($endpoints);
        const endpoint = endpoints.value.endpoints.find(
          (endpoint) => endpoint.id === props.endpointId
        );
        const userName = computed(() =>
          Object.keys(reactions.value.reactions).find((user) => user.includes(endpoint.userName))
        );
        userReactions = computed(() => reactions.value.reactions[userName.value] || []);
      }

      return {
        userReactions,
        reactions,
      };
    },
  };
</script>

<style scoped>
  .emoji-panel {
    padding: 17px 0;
    border-radius: var(--pad16);
    @media (width >= 768px) {
      background-color: transparent;
      padding: 16px 20px;
    }

    & .emoji-wrap {
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    & .emoji {
      font-size: 32px;
      padding: 6px;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      & span {
        opacity: 1;
        transition: opacity 0.2s ease-in-out;
      }
      & .color {
        filter: grayscale(0%);
      }
    }
  }
</style>
