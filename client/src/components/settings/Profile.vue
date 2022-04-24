<template lang="pug">
.profile
  .edit
    SignInAccount.account(
      :userName="auth.displayName"
      :email="auth.email"
      :avatar="auth.picture"
      :isProfile="true"
    )
    // Button.icon(
        size="m"
        mode="flat"
        //:icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-edit-gray' }"
        /:disabled="false"
        iconOnly
        @click="openDrawer"
        )
  // .languages
      Select.select.microphone(
        v-model:modelValue="activeItem"
        label="Language"
        //:options="languagesList"
        //:searchable="false"
        placeholder="None"
        //:disabled="false"
        id="microphone"
      )
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import SignInAccount from '@/components/accounts/SignInAccount.vue';
  import { Button, Select } from '@voximplant/spaceui';
  import { useStore } from 'effector-vue/composition';
  import { authStore } from '@/store/auth';

  export default defineComponent({
    name: 'Profile',
    components: {
      SignInAccount,
      Button,
      Select,
    },
    props: {
      languagesList: {
        type: Array,
        default: () => [
          {
            label: 'Russian',
            value: 1,
          },
          {
            label: 'English',
            value: 2,
          },
          {
            label: 'Spanish',
            value: 3,
          },
        ],
      },
    },
    setup(props) {
      const activeItem = ref(props.languagesList[0]);
      const auth = useStore(authStore);

      return {
        activeItem,
        auth,
      };
    },
  });
</script>

<style scoped>
  .profile {
    padding-top: var(--pad40);
    &::v-deep(.avatar) {
      @media (width >= 768px) {
        width: var(--pad56);
        height: var(--pad56);
        margin-right: var(--pad16);
      }
    }
    &::v-deep(.name) {
      @media (width >= 768px) {
        font-weight: normal;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 4px;
      }
    }
    &::v-deep(.email) {
      @media (width >= 768px) {
        color: var(--gray600);
        max-width: 190px;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    & .account {
      justify-content: flex-start;
    }
    & .edit {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: var(--pad24);
    }
  }
</style>
