<template lang="pug">
.mobile-download
  .download-wrap
    .background-wrap(v-if="isEmpty")
      img.background-image(:src="require('../../assets/images/no-attach-files-background.png')")
      p.background-text {{ t('fileInput.noFiles') }}
    .file-wrap(v-else)
      DownloadedFiles.mobile-file 
  .button-wrap
    Button.button-download(
      mode="primary"
      size="l"
      @click="closeDrawer"
      ) {{ t('fileInput.title') }}
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Button } from '@voximplant/spaceui';
  import { closeDrawer } from '@/store/drawer';
  import DownloadedFiles from '@/components/decorative-elements/DownloadedFiles.vue';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'MobileDownloadFile',
    components: {
      Button,
      DownloadedFiles,
    },
    props: {
      isEmpty: {
        type: Boolean,
        default: true,
      },
    },
    setup() {
      const { t } = useI18n();
      return {
        t,
        closeDrawer,
      };
    },
  });
</script>

<style scoped>
  .mobile-download {
    font-family: var(--fontRoboto);
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    position: relative;
    & .download-wrap {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: stretch;
      padding: var(--pad16);
      overflow: hidden;
      position: relative;
    }
    .mobile-file:not(:last-child) {
      margin-bottom: 12px;
    }
    & .background-wrap {
      margin: 0 auto;
    }
    & .background-image {
      width: 96px;
      height: 100px;
    }
    & .background-text {
      color: var(--gray500);
      font-size: var(--pad16);
      line-height: var(--pad20);
    }
    & .file-wrap {
      align-self: flex-end;
      width: 100%;
      overflow-y: auto;
      height: 100%;
    }
    & .button-wrap {
      padding: var(--pad16);
      box-shadow: inset 0 1px 0 #ebedf2;
      width: 100%;
    }
    & .button-download {
      display: block;
      max-width: 100%;
      width: 100%;
    }
  }
</style>
