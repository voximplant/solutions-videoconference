<template lang="pug">
.sign-in
  FormJoin(v-if="!authS.jwt")
  // FormDefault
  FormAccount(v-if="authS.jwt")
</template>

<script lang="ts">
  import Logo from '@/components/Logo.vue';
  import { defineComponent } from 'vue';
  import FormJoin from '@/components/layout-forms/FormJoin.vue';
  import FormDefault from '@/components/layout-forms/FormDefault.vue';
  import FormAccount from '@/components/layout-forms/FormAccount.vue';
  import SettingsInDefault from '@/components/layout-settings/SettingsInDefault.vue';
  import { useStore } from 'effector-vue/composition';
  import { authStore, restoreAuth } from '@/store/auth.ts';
  import '@/store/chat/init';

  export default defineComponent({
    name: 'SignIn',
    components: {
      Logo,
      FormJoin,
      FormDefault,
      FormAccount,
      SettingsInDefault,
    },
    setup() {
      const authS = useStore(authStore);
      restoreAuth();
      return {
        authS,
      };
    },
  });
</script>

<style scoped></style>
