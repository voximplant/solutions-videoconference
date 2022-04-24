<template lang="pug">
Notification.notificator(v-bind="notificatorArg" @close="changeUserStatus(statusType.none)")
</template>

<script lang="ts">
  import { Notification } from '@voximplant/spaceui';
  import { defineComponent } from 'vue';
  import { changeUserStatus, userStatusStore, statusType } from '@/store/meeting';
  import { useStore } from 'effector-vue/composition.cjs';

  export default defineComponent({
    name: 'UserStatus',
    components: {
      Notification,
    },
    setup() {
      const userStatus = useStore(userStatusStore);
      const notificatorArg = {
        mode: '',
        title: '',
      };
      switch (userStatus.value.status) {
        case statusType.connection:
          notificatorArg.mode = 'loading';
          notificatorArg.title = 'Waiting for connection to the conference.';
          break;
        case statusType.waitingConfirmation:
          notificatorArg.mode = 'loading';
          notificatorArg.title = 'The admin denied you access to the conference.';
          break;
        case statusType.denialAccess:
          notificatorArg.mode = 'error';
          notificatorArg.title = 'The admin denied you access to the conference.';
          break;
      }
      return {
        notificatorArg,
        changeUserStatus,
        statusType,
      };
    },
  });
</script>

<style scoped>
  .notificator {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
  }
</style>
