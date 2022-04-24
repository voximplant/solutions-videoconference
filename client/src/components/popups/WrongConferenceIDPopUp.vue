<template lang="pug">
Popup.wrong-conference-popup(:title="title")
  Button(@click="handleRedirect") OK
</template>

<script lang="ts">
  import { defineComponent, onMounted } from 'vue';
  import { useStore } from 'effector-vue/composition';
  import { Button } from '@voximplant/spaceui';
  import { authStore } from '@/store/auth';
  import PopUpWithButton from '@/components/popups/PopUpWithButton.vue';
  import { Popup, Typography } from '@voximplant/spaceui';
  import Modal from '@/components/Modal.vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'WrongConferenceIDPopUp',
    components: {
      Popup,
      Button,
      Typography,
    },
    setup() {
      const { t } = useI18n();
      const router = useRouter();
      const title = t('join.wrongID');

      const handleRedirect = () => {
        router.push({ name: 'Signin' });
      };

      return {
        title,
        handleRedirect,
      };
    },
  });
</script>

<style scoped>
  .wrong-conference-popup::v-deep(.close-button) {
    display: none;
  }
</style>
