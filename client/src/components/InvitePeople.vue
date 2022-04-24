<template lang="pug">
.invite-people
  .title {{title}}
  .text {{ t('invitePeople.description') }}
  Input(id="copy" type="copy" :modelValue="link")
  // .text {{ t('invitePeople.call') }}
    .country-number
      Select.country-select(v-model:modelValue="active" :options="countries")
      .number {{number}}
      .pin
        span.pin-word {{ t('invitePeople.pin') }}:
        span {{pin}}
    .text {{ t('invitePeople.email') }}
    .send-invite
      .email
      .send-invite-text {{ t('invitePeople.send') }}
</template>

<script lang="ts">
  import { defineComponent, onMounted } from 'vue';
  import { getLink, getPin } from '@/helpers/link';
  import { Select, Input } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  import { toggleInvitePopup } from '@/store/popup';

  export default defineComponent({
    components: {
      Select,
      Input,
    },
    data() {
      return {
        active: this.activeCountry,
      };
    },
    props: {
      title: {
        type: String,
      },
      number: {
        type: String,
      },
      countries: {
        type: Array,
      },
      activeCountry: {
        type: Object,
      },
    },
    setup() {
      const { t } = useI18n();
      const link = getLink();
      const closePopup = () => {
        toggleInvitePopup(false);
      };
      onMounted(() => {
        const source = document.getElementsByClassName('hint-container');
        if (source.length) source[0].addEventListener('click', () => setTimeout(closePopup, 600));
      });
      return {
        t,
        link,
        pin: getPin(),
      };
    },
  });
</script>

<style scoped>
  .invite-people {
    & .title {
      position: relative;
      font-family: var(--fontRoboto);
      font-style: normal;
      font-weight: 500;
      font-size: 24px;
      line-height: 28px;
      color: var(--purple900);
    }
    & .close-modal {
      background-image: url('../assets/close.svg');
      background-repeat: no-repeat;
      background-position: center;
      position: absolute;
      width: 20px;
      height: 20px;
      right: 4px;
      top: 9px;
    }
    & .text {
      position: relative;
      margin-bottom: 12px;
      font-family: var(--fontRoboto);
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      color: var(--gray600);
    }
    & .invite-link-container {
      position: relative;
      padding: 10px 12px 10px 12px;
      height: 40px;
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid #e3e4eb;
      box-sizing: border-box;
      border-radius: 8px;
      font-family: var(--fontRoboto);
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      display: flex;
      align-items: center;
      text-align: center;
      color: var(--gray900);
    }
    & .copy-paste {
      position: absolute;
      width: 25px;
      height: 25px;
      right: 12px;
      top: 9px;
      background-image: url('../assets/copy_paste.svg');
      background-repeat: no-repeat;
      background-position: center;
    }
    & .country-number {
      position: relative;
      display: flex;
      justify-content: space-between;
      height: 40px;
      margin-bottom: 24px;
    }
    & .country-select {
      width: 98px;
      height: 40px;
      font-family: var(--fontRoboto);
      & .sui-select-head {
        width: 98px;
        height: 40px;
        margin-top: 0;
      }
      & .sui-active-item-icon {
        flex-shrink: 0;
      }
      & .sui-select-input {
        width: 20px;
      }
    }
    & .number,
    & .pin {
      width: 109px;
      height: 40px;
      font-family: var(--fontRoboto);
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      display: flex;
      align-items: center;
      color: var(--gray900);
      margin-left: 12px;
    }
    & .pin-word {
      color: var(--gray600);
      margin-right: 4px;
    }
    & .send-invite {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 8px 12px;
      position: relative;
      height: 40px;
      left: 0;
      right: 0;
      background: var(--purple500);
      border-radius: 8px;
      box-sizing: border-box;
      color: #ffffff;
      flex: none;
      order: 1;
      flex-grow: 0;
      font-family: var(--fontRoboto);
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
    }
    & .email {
      background-image: url('../assets/email.svg');
      background-repeat: no-repeat;
      background-position: center;
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }
  }
</style>
