<template lang="pug">
.about {{ t('signPug') }}
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { redirectUri } from '@/helpers/googleAuth';
  import { makeAuth } from '@/store/auth';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'SignInOauth',
    components: {},
    setup: () => {
      const { t } = useI18n();
      const router = useRouter();
      const route = useRoute();
      (async () => {
        const search = route.fullPath.substring(route.fullPath.indexOf('?'));
        const urlParams = new URLSearchParams(search);
        const params: Record<string, string> = {};
        urlParams.forEach((v, k) => (params[k] = v));
        try {
          await makeAuth({ code: params.code, redirectUri });
          // eslint-disable-next-line no-debugger
          const conference = sessionStorage.getItem('backLink');
          if (conference) {
            await router.replace({
              name: 'Join',
              params: {
                conference,
              },
            });
          } else {
            await router.replace({
              name: 'Signin',
            });
          }
        } catch {
          await router.replace({
            name: 'Signin',
          });
        }
      })();

      return {
        t,
      };
    },
  });
</script>
