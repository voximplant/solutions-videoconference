<template lang="pug">
.contact-list
  .header(v-if="isMobileScreen" )
    Button.back-btn(
      :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-shape'}"
      size="s"
      mode="flat"
      @click="openDrawer('settings')"
    ) {{ t('back') }}
    h2.title(v-if="isMobileScreen" ) {{ t('buttons.users') }} ({{ contacts.length }})

  .contact-list-wrap
    //.waiting-room(v-if="waitingRoom.length" )
        p.statusTitle in waiting room ({{ waitingRoom.length }})
        ContactItem(
          v-for="item in waitingRoom"
          //:item="item.chatUser.displayName"
          //:image="item.authUser.avatar"
          type="wait"
        )
    .in-call
      p.statusTitle {{ t('userStatus.inCall') }}
      ContactItem(
        v-for="item in inCall"
        :item="item.chatUser.displayName"
        :key="item.endpointId"
        :userName="item.chatUser.userName"
        :endpointId="item.endpointId"
        :image="item.authUser.avatar"
        type="inCall"
        )
    .no-active(v-if="notActive.length" )
      p.statusTitle {{ t('userStatus.offline') }}
      ContactItem(
        v-for="item in notActive"
        :item="item.chatUser.displayName"
        :image="item.authUser.avatar"
        type="offline"
      )
  .footer
    Button.copy-link-btn(
      :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: 'ic25-add-user', color: '--sui-gray-700'}"
      width="fill-container"
      height="48px"
      mode='secondary'
      size="l"
      @click="openPopup"
    ) {{ t('invitePeople.invite') }}
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import ContactItem from '@/components/chat/ContactItem.vue';
  import RadioInput from '@/components/inputs/RadioInput.vue';
  import { closeDrawer, openDrawer } from '@/store/drawer';
  import { Popup, Button, Input } from '@voximplant/spaceui';
  import { useIsMobileScreen } from '@/hooks/useIsMobile';
  import { getLink } from '@/helpers/link';
  import { $users } from '@/store/users';
  import { useI18n } from 'vue-i18n';
  import { toggleInvitePopup } from '@/store/popup';
  import InvitePeople from '@/components/InvitePeople.vue';
  import { useStore } from 'effector-vue/composition';

  export default defineComponent({
    name: 'ContactList',
    components: {
      InvitePeople,
      ContactItem,
      Button,
      Input,
      RadioInput,
      Popup,
    },
    setup() {
      const { t } = useI18n();
      const { isMobileScreen } = useIsMobileScreen();
      const link = getLink();
      const openPopup = () => toggleInvitePopup(true);
      const usersStore = useStore($users);
      const contacts = computed(() => {
        return [...usersStore.value.users, usersStore.value.me];
      });

      const inCall = computed(() => {
        return contacts.value.filter((user) => user?.inCall) || [];
      });

      const notActive = computed(() => {
        return contacts.value.filter((user) => !user?.inCall) || [];
      });
      return {
        t,
        link,
        openPopup,
        openDrawer,
        closeDrawer,
        isMobileScreen,
        inCall,
        notActive,
        contacts,
      };
    },
  });
</script>

<style scoped>
  .contact-list {
    font-family: var(--fontRoboto);
    overflow: hidden;
    @media (width >= 768px) {
      height: calc(100vh - 62px);
    }
    @media (width < 768px) {
      height: 100vh;
    }
    & .header {
      display: flex;
      height: 40px;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: center;
      margin-bottom: var(--pad40);
      & .back-btn {
        position: absolute;
        left: 12px;
        top: 6px;
        &::v-deep(.icon-container) {
          margin: 0;
        }
      }
    }

    & .done-btn {
      position: absolute;
      right: var(--pad16);
      top: 30px;
    }
    & .title {
      color: var(--gray800);
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      padding: 0 var(--pad16);
      margin: auto;
    }
    & .send-all {
      box-shadow: inset 0 -1px 0 #ebedf2;
    }
    & .contact-list-wrap {
      display: flex;
      flex-direction: column;
      row-gap: 24px;
      overflow-y: scroll;
      height: calc(100% - 90px);
      padding: var(--pad24) var(--pad16) 0 var(--pad20);

      @media (width < 768px) {
        height: calc(100% - 168px);
      }

      & .statusTitle {
        color: var(--gray500);
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
        text-transform: uppercase;
        margin-bottom: var(--pad16);
      }
    }
    & .footer {
      display: flex;
      justify-content: center;
      flex-direction: column;
      padding: var(--pad16);
      bottom: 0;
      height: 88px;
      width: 100%;
      box-shadow: inset 0 1px 0 #ebedf2;

      &::v-deep(.sui-input-wrapper) {
        margin: auto;
      }

      & .copy-link {
        visibility: hidden;
        max-width: 0;
        max-height: 0;
      }
    }
  }
</style>
