<template lang="pug">
.users-button
  PopUpWithButton.users(name="ic25-users" size="25px")
    template(v-slot:content)
      .content-wrap
        TitleOption.title-option(title="users")
        .contact-wrap
          ContactItem( 
            v-for="item in chatStore.users"
            :item="item.user.displayName"
            :image="item.auth.avatar"
          )
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import TitleOption from '@/components/settings/TitleOption.vue';
  import PopUpWithButton from '@/components/popups/PopUpWithButton.vue';
  import ContactItem from '@/components/chat/ContactItem.vue';
  import { useStore } from 'effector-vue/composition';
  import { $chatContent } from '@/store/chat/index';

  export default defineComponent({
    name: 'UsersButton',
    components: {
      ContactItem,
      PopUpWithButton,
      TitleOption,
    },
    setup() {
      const chatStore = useStore($chatContent);

      return {
        chatStore,
      };
    },
  });
</script>

<style scoped>
  .users-button {
    &::v-deep(.popup-wrap) {
      left: auto;
      right: 0;
      width: 260px;
    }
    & .content-wrap {
      padding: var(--pad20) 0;
      width: 100%;
    }
    & .title-option {
      padding: 0 var(--pad16) var(--pad8);
    }
    & .contact-wrap {
      overflow-x: hidden;
      overflow-y: auto;
      height: calc(100vh - 150px);
    }
  }
</style>
