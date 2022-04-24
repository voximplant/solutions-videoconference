<template lang="pug">
.meeting-info
  .meeting-wrap(@click="toggleClass" :class="{'active': isActive}" ref="PopUpRef")
    p.meeting-name {{ name }}
    p.meeting-time {{ time }}
    .chevron
  transition(name="admin-settings")
    .admin-settings(v-if="isActive" ref="PopUpButtonRef")
      .invite-wrap
        h3.settings-title.invite {{ t('invitePeople.title') }}
        p.settings-description {{ t('invitePeople.description') }}
        Input.copy-link(id="copy" type="copy" :modelValue="link" ref="input" )
      .files-wrap(v-if="false")
        .title-wrap
          h3.settings-title {{ t('fileInput.attached') }}
            span(v-if="!isEmpty") {{ `(${count})` }}
          Button(v-if="!isEmpty" size="s" mode="flat") {{ t('fileInput.delete') }}
        p.text-empty(v-if="isEmpty") {{ t('fileInput.noFiles') }}
        DownloadedFiles(v-if="!isEmpty")
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    onBeforeMount,
    ref,
    watch,
  } from 'vue';
  import { Input, Button, generateCheckClickOutside } from '@voximplant/spaceui';
  import DownloadedFiles from '@/components/decorative-elements/DownloadedFiles.vue';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'MeetingInfoWithPopup',
    components: {
      Input,
      Button,
      DownloadedFiles,
    },
    props: {
      name: {
        type: String,
        default: 'Meeting name',
      },
      link: {
        type: String,
        default: 'videoconf.voximplant.com',
      },
      count: {
        type: Number,
        default: 1,
      },
      isEmpty: {
        type: Boolean,
        default: false,
      },
    },
    setup() {
      const { t } = useI18n();
      const input = ref(null);
      // const name = t('nameDefault');
      const isActive = ref(false);
      const PopUpRef = ref<HTMLElement | null>(null);
      const PopUpButtonRef = ref<HTMLElement | null>(null);
      const checkClickOutside = computed(() =>
        generateCheckClickOutside([PopUpRef, PopUpButtonRef])
      );
      const onClickOutside = (e: MouseEvent) => {
        if (checkClickOutside.value(e)) {
          isActive.value = false;
        }
      };

      const toggleClass = () => {
        isActive.value = !isActive.value;
      };

      const onKeyDownEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          isActive.value = false;
        }
      };

      let date = new Date(0, 0, 0);
      let seconds = 1000;
      const formatTime = (date: Date) => date.toTimeString().split(' ')[0];
      let time = ref(formatTime(date));

      watch(input, () => {
        const source = document.getElementsByClassName('hint-container');
        if (source.length) source[0].addEventListener('click', () => setTimeout(toggleClass, 600));
      });

      onBeforeMount(() => {
        setInterval(() => {
          date = new Date(date.getTime() + seconds);
          time.value = formatTime(date);
        }, 1000);
      });
      onMounted(() => {
        document.addEventListener('click', onClickOutside, { capture: true });
        document.addEventListener('keydown', onKeyDownEsc);
      });
      onBeforeUnmount(() => {
        document.removeEventListener('click', onClickOutside, {
          capture: true,
        });
        document.removeEventListener('keydown', onKeyDownEsc);
      });

      return {
        t,
        input,
        // name,
        isActive,
        toggleClass,
        PopUpRef,
        PopUpButtonRef,
        time,
      };
    },
  });
</script>

<style scoped>
  .meeting-info {
    position: relative;
    & .meeting-wrap {
      display: flex;
      justify-content: flex-start;
      min-width: 112px;
      max-width: 235px;
      font-family: var(--fontRoboto);
      color: var(--gray700);
      font-size: 14px;
      line-height: 20px;
      cursor: pointer;
      padding: 34px var(--pad8) 34px var(--pad24);
      height: 100%;
      transition: color 0.5s ease-in;
      overflow: hidden;
      &:hover {
        background: var(--gray100);
      }
    }
    .meeting-name {
      text-overflow: ellipsis;
      height: 20px;
      max-width: 132px;
      white-space: nowrap;
      overflow: hidden;
      margin-right: var(--pad8);
    }
    & .meeting-time {
      margin-right: var(--pad8);
    }
    & .chevron {
      width: 20px;
      height: 20px;
      background: url('../../assets/images/icon/ic20-chevron-up.svg');
      transition: all 0.5s ease-in;
    }
    & .active {
      color: var(--purple500);
      background: var(--gray100);
      transition: color 0.5s ease-in;
    }
    & .active .chevron {
      transform: rotate(180deg);
      filter: hue-rotate(10deg) saturate(40) contrast(1.6);
      transition: all 0.3s ease-in;
    }
    & .admin-settings {
      background-color: var(--white);
      font-family: var(--fontRoboto);
      width: 324px;
      min-height: 100px;
      max-height: 373px;
      position: absolute;
      border: 1px solid #e3e4eb;
      box-shadow: 0 2px 8px rgba(40, 41, 61, 0.04), 0 16px 24px rgba(96, 97, 112, 0.16);
      border-radius: 12px;
      bottom: 100%;
      left: var(--pad16);
      overflow-x: hidden;
      overflow-y: auto;
      z-index: 2;
    }
    & .invite-wrap {
      padding: var(--pad24);
      box-shadow: inset 0 -1px 0 #ebedf2;
    }
    & .settings-title {
      color: var(--purple900);
      font-weight: 500;
      font-size: var(--pad16);
      line-height: var(--pad20);
    }
    & .invite {
      margin-bottom: 12px;
    }
    & .copy-link {
      margin-bottom: 0;
    }
    & .settings-description {
      color: var(--gray600);
      font-size: 14px;
      line-height: var(--pad20);
      margin-bottom: var(--pad8);
    }
    &::v-deep(.sui-input) {
      width: 100%;
    }
    & .files-wrap {
      padding: var(--pad24);
    }
    & .title-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--pad16);
    }
    & .text-empty {
      color: var(--gray600);
      font-size: 14px;
      line-height: var(--pad20);
      width: 100%;
      text-align: center;
    }
    .admin-settings-enter-to,
    .admin-settings-leave-from {
      transform: translateY(0);
      opacity: 1;
    }
    .admin-settings-leave-to,
    .admin-settings-enter-from {
      transform: translateY(10px);
      opacity: 0;
    }
    .admin-settings-enter-active,
    .admin-settings-leave-active {
      transition: all 0.2s;
    }
  }
</style>
