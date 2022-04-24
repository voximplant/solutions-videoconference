<template lang="pug">
.video-conference
  LayoutsPanel

</template>

<script lang="ts">
  import { defineComponent, onMounted } from 'vue';
  import LayoutsPanel from '@/components/layouts/LayoutsPanel.vue';
  import { useStore } from 'effector-vue/composition';
  import { AuthState, authStore } from '@/store/auth';
  import { useRoute, useRouter } from 'vue-router';
  import { $drawer, closeDrawer } from '@/store/drawer';
  import '@/store/endpointMedia/init';

  export default defineComponent({
    name: 'VideoConference',
    components: {
      LayoutsPanel,
    },
    setup() {
      const router = useRouter();
      const route = useRoute();
      const drawerStore = useStore($drawer);
      const { conference } = route.params;
      const authS = useStore(authStore);
      console.error('authS.value.authState', authS.value.authState);
      if (authS.value.authState === AuthState.NoAuth) {
        if (conference) {
          router.replace({
            name: 'Join',
            params: { conference },
          });
        } else {
          router.replace({
            name: 'Signin',
          });
        }
      }
      onMounted(() => {
        if (drawerStore.value.opened) {
          closeDrawer();
        }
      });
      return {
        authS,
      };
    },
  });
</script>

<style scoped></style>
