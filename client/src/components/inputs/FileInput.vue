<template lang="pug">
.input-file
  h3 {{ t('fileInput.title') }}
  .container-input
    .container-text
      Icon.icon-download(
        spriteUrl="/image/videoconf-icons.svg"
        name="ic25-download"
      )
      p.text-input-file {{ t('fileInput.input') }}
        label.text-downloaded(for="downloaded" tabindex="0") {{ t('fileInput.browse') }}
          input.input(type="file" name="file" id="downloaded" multiple)
    p.text-max-size {{ t('fileInput.maxSize') }}
  .wrap-downloaded-files(v-if="isDefault")
    Button.text-delete-all(v-if="false" size="s" mode="flat") {{ t('fileInput.delete') }}
    DownloadedFiles
    DownloadedFiles
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import DownloadedFiles from '@/components/decorative-elements/DownloadedFiles.vue';
  import { Icon, Button } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  export default defineComponent({
    name: 'FileInput',
    components: {
      DownloadedFiles,
      Icon,
      Button,
    },
    props: {
      isDefault: {
        type: Boolean,
        default: true,
      },
    },
    setup() {
      const { t } = useI18n();
      return {
        t,
      };
    },
  });
</script>

<style scoped>
  .input-file {
    font-family: var(--fontRoboto);
    width: 100%;
    & h3 {
      font-family: var(--fontRoboto);
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
      margin-bottom: 4px;
    }

    & .container-input {
      padding: 19px 60px var(--pad20);
      border: 1px dashed var(--gray300);
      border-radius: var(--pad8);
      margin-bottom: 4px;
    }

    & .container-text {
      display: flex;
      justify-content: center;
    }

    & .input {
      display: none;
    }
    & .text-input-file {
      padding: 5px 0 4px;
      text-align: center;
      color: var(--gray900);
      font-size: 12px;
      line-height: 16px;
    }
    & .text-downloaded {
      display: inline-block;
      cursor: pointer;
      color: var(--purple100);
      &:focus {
        box-shadow: 0 0 0 2px var(--sui-blue-500);
      }
    }
    & .text-max-size {
      text-align: center;
      font-size: 10px;
      line-height: 16px;
      color: var(--gray600);
    }
    & .icon-download {
      margin-right: var(--pad8);
    }
    & .text-delete-all {
      display: block;
      cursor: pointer;
      border: none;
      outline: none;
      background-color: inherit;
      text-align: right;
      font-size: 12px;
      line-height: var(--pad16);
      color: var(--purple500);
      margin-bottom: 4px;
    }
  }
</style>
