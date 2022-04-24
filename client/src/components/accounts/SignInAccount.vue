<template lang="pug">
.google-account
  .avatar-wrap(:class="{'changed': isProfile}")
    img.avatar(:src="avatar")
  .name-wrap
    p.name {{ userName }}
    p.email {{ email }}
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'SignInAccount',
    components: {},
    // isProfile - use to change info
    props: {
      avatar: {
        type: String,
        default: require('@/assets/images/mocks/icon-A.svg'),
      },
      userName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      isProfile: {
        type: Boolean,
        default: false,
      },
    },
  });
</script>

<style scoped>
  .google-account {
    display: flex;
    justify-content: center;
    align-items: center;
    & .avatar {
      width: var(--pad48);
      height: var(--pad48);
      margin-right: 12px;
      border-radius: 50%;
    }
    & .name {
      font-weight: 500;
      font-size: var(--pad16);
      line-height: 20px;
      color: var(--gray900);
      margin-bottom: 2px;
      @media (width >= 768px) {
        font-size: 14px;
      }
    }
    & .email {
      font-size: 14px;
      line-height: 20px;
      color: var(--gray700);
      @media (width >= 768px) {
        font-size: 12px;
        line-height: var(--pad16);
      }
    }
    & .changed {
      cursor: pointer;
      &::before {
        content: '';
        position: absolute;
        width: 56px;
        height: 56px;
        background: url('../../assets/images/icon/ic20-edit.svg') 50% 50% no-repeat
          rgba(31, 28, 40, 0.8);
        background-size: var(--pad20);
        border-radius: 12px;
        z-index: 5;
        opacity: 0;
        transition: opacity 0.1s ease-in;
      }
    }
  }
</style>
