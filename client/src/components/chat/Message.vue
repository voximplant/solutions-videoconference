<template lang="pug">
.message
  img.avatar(:src="avatar" :alt="name")
  .message-wrap
    .name-wrap
      .name-status
        p.name {{ name }}
        ButtonStatus(v-if="isPrivate")
      p.time {{ time }}
    p.text {{ message }}

</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import ButtonStatus from '@/components/chat/ButtonStatus.vue';

  export default defineComponent({
    name: 'Message',
    components: {
      ButtonStatus,
    },
    props: {
      name: {
        type: String,
      },
      message: {
        type: String,
      },
      avatar: {
        type: String,
      },
      time: {
        type: String,
      },
      isPrivate: {
        type: Boolean,
        default: false,
        required: false,
      },
    },
  });
</script>

<style scoped>
  .message {
    display: flex;
    align-items: flex-start;
    font-family: var(--fontRoboto);
    & .message-wrap {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    & .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: var(--pad8);
      @media (width >= 768px) {
        width: 32px;
        height: 32px;
      }
    }

    & .name-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      @media (width >= 768px) {
        margin-bottom: 4px;
      }
    }

    & .name-status {
      display: flex;
      align-items: flex-end;
    }

    & .name {
      font-size: 14px;
      line-height: var(--pad20);
      color: var(--purple500);
      margin-right: 4px;
      @media (width >= 768px) {
        font-size: 12px;
        line-height: var(--pad16);
      }
    }

    & .time {
      font-size: 12px;
      line-height: var(--pad16);
      color: var(--gray500);
      @media (width >= 768px) {
        font-size: 10px;
        line-height: 12px;
      }
    }
    & .text {
      color: var(--gray900);
      font-size: var(--pad16);
      line-height: var(--pad20);
      word-break: break-all;
      @media (width >= 768px) {
        font-size: 14px;
        line-height: var(--pad20);
      }
    }
  }
</style>
