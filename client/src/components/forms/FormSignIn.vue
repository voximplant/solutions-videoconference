<template lang="pug">
.form-wrap
  h2.form-title {{ title }}
  .account-wrap(v-if="isAccount")
    SignInAccount(:userName="auth.displayName" :email="auth.email" :avatar="auth.picture")
  form.form

    Button(v-if="isDefault || isAccount" type="primary" @click="joinConf").button-join {{ textButton }}
  //Input(v-if="isDefault || isAccount" label="Meeting name (optional)" value="meeting-name" placeholder="Enter meeting name").meeting-name
  //  Input(v-if="isDefault || isJoin" label="Email" value="email" placeholder="Enter email").email
  //  Input(v-if="isDefault || isJoin" label="Username" value="username" placeholder="Enter display username").username
  //p.alternative(v-if="isDefault || isJoin") {{ alternative }}
  .buttons-wrap(v-if="isDefault || isJoin")
    Button(
      mode="outlined"
      :disabled="auth.authState === AuthState.Processing"
      @click="makeGoogleAuth()"
      :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: `ic${getIconSize()}-google`}").button-alternative {{ 'GOOGLE' }}
    //Button(mode="outlined" :icon="{ spriteUrl: '/image/videoconf-icons.svg', name: `ic${getIconSize()}-facebook`}").button-alternative {{ 'FACEBOOK' }}
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Button, Input } from '@voximplant/spaceui';
  import SignInAccount from '@/components/accounts/SignInAccount.vue';
  import { getRedirectUrl } from '@/helpers/googleAuth';
  import { useStore } from 'effector-vue/composition';
  import { authStore, AuthState } from '@/store/auth';
  import { createMeeting } from '@/store/meeting';
  import { useRouter } from 'vue-router';

  export default defineComponent({
    name: 'FormSignIn',
    components: {
      Input,
      Button,
      SignInAccount,
    },

    props: {
      title: {
        type: String,
        required: true,
      },
      alternative: {
        type: String,
        required: false,
      },
      textButton: {
        type: String,
        required: true,
      },
      isDefault: {
        type: Boolean,
        default: false,
        required: false,
      },
      isJoin: {
        type: Boolean,
        default: false,
        required: false,
      },
      isAccount: {
        type: Boolean,
        default: false,
        required: false,
      },
    },

    setup() {
      const router = useRouter();
      const getIconSize = function () {
        if (window.innerWidth < 768) return '24';
        else return '20';
      };
      const makeGoogleAuth = () => {
        location.href = getRedirectUrl();
      };
      const auth = useStore(authStore);
      const joinConf = async (e: Event) => {
        e.preventDefault();
        try {
          const meeting = await createMeeting();
          if (meeting.meetingId) {
            await router.replace({
              name: 'Join',
              params: {
                conference: meeting.meetingId,
              },
            });
          }
          //TODO: Show error
        } catch (e) {
          console.error(e);
          //TODO: Show error
        }
      };
      return {
        getIconSize,
        makeGoogleAuth,
        auth,
        joinConf,
        AuthState
      };
    },
  });
</script>

<style scoped>
  .form-wrap {
    max-width: 327px;
    margin: 0 auto var(--pad16);
    font-family: var(--fontRoboto);
    @media (width >= 768px) {
      max-width: 344px;
    }
    @media (width >= 768px) {
      margin-bottom: var(--pad24);
    }
    & .form-title {
      font-weight: 500;
      text-align: center;
      font-size: var(--pad24);
      line-height: 28px;
      margin-bottom: var(--pad24);
      color: var(--gray900);
      @media (width >= 768px) {
        margin-bottom: var(--pad32);
        font-size: var(--pad24);
        line-height: var(--pad32);
      }
    }
    & .account-wrap {
      margin-bottom: var(--pad24);
      @media (width >= 768px) {
        margin-bottom: var(--pad32);
      }
    }
    & .form {
      width: 100%;
      margin-bottom: var(--pad16);
      @media (width >= 768px) {
        margin-bottom: var(--pad24);
      }
    }
    & .form-title {
      font-weight: 500;
      text-align: center;
      font-size: var(--pad24);
      line-height: 28px;
      color: var(--gray900);
      margin-bottom: var(--pad24);
      @media (width >= 768px) {
        margin-bottom: var(--pad32);
        font-size: var(--pad24);
        line-height: var(--pad32);
      }
    }
    & .sui-input-wrapper {
      align-items: stretch;
    }
    & ::v-deep(.sui-label) {
      color: var(--gray800);
      font-size: var(--pad16);
      line-height: 20px;
      @media (width >= 768px) {
        font-size: 14px;
        line-height: var(--pad16);
      }
    }
    &::v-deep(.sui-input-wrapper .sui-border) {
      justify-content: stretch;
      border-radius: var(--pad8);
      height: var(--pad48);
      @media (width >= 768px) {
        height: var(--pad40);
      }
    }

    &::v-deep(.sui-input) {
      width: 100%;
      font-family: var(--fontRoboto);
      &::placeholder {
        color: var(--gray600);
        font-size: var(--pad16);
        line-height: 20px;
        @media (width >= 768px) {
          font-size: 14px;
        }
      }
    }

    &::v-deep(.sui-button-icon) {
      width: var(--pad24);
      height: var(--pad24);
      margin-right: var(--pad8);
      @media (width >= 768px) {
        width: var(--pad20);
        height: var(--pad20);
      }
    }

    & .email {
      margin-bottom: var(--pad24);
    }
    & .username {
      margin-bottom: var(--pad24);
    }
    & .meeting-name {
      margin-bottom: var(--pad24);
      @media (width >= 768px) {
        margin-bottom: var(--pad32);
      }
    }

    & .button-join {
      display: block;
      max-width: 100%;
      width: 100%;
      border-radius: var(--pad8);
      min-height: var(--pad48);
      font-size: var(--pad16);
      @media (width >= 768px) {
        font-size: 14px;
        min-height: var(--pad40);
      }
    }
    & .button-join::v-deep(.sui-button-content) {
      font-size: var(--pad16);
      line-height: var(--pad20);
      @media (width >= 768px) {
        font-size: 14px;
      }
    }

    & .alternative {
      color: var(--gray900);
      text-align: center;
      font-size: var(--pad16);
      line-height: var(--pad20);
      margin-bottom: var(--pad16);
      @media (width >= 768px) {
        font-size: 12px;
        line-height: var(--pad16);
        margin-bottom: var(--pad24);
      }
    }
    & .buttons-wrap {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      @media (width >= 768px) {
        flex-wrap: nowrap;
      }
    }
    & .button-alternative {
      box-sizing: border-box;
      max-width: 100%;
      width: 100%;
      justify-content: center;
      border-radius: var(--pad8);
      font-weight: 500;
      font-size: 12px;
      line-height: var(--pad16);
      color: var(--gray700);
      min-height: var(--pad48);
      height: var(--pad48);
      &:first-child {
        margin-bottom: var(--pad16);
        @media (width >= 768px) {
          margin-right: var(--pad16);
          margin-bottom: 0;
        }
      }
      @media (width >= 768px) {
        min-height: var(--pad40);
        height: var(--pad40);
      }
    }
    & .button-alternative::v-deep(.sui-button-content) {
      @media (width >= 768px) {
        font-size: 12px;
        line-height: var(--pad16);
      }
    }
  }
</style>
