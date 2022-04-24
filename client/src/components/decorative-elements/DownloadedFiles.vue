<template lang="pug">
.downloaded
  Icon.icon-file(
    name="ic20-file"
    color="--sui-purple-500"
  )
  p.file-name json_file_extension.xls {{ ' ' }}
    span.file-size 350 KB
  Icon.icon-delete(
    spriteUrl="/image/videoconf-icons.svg"
    name="ic20-delete-gray" 
  )
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Icon } from '@voximplant/spaceui';
  export default defineComponent({
    name: 'DownloadedFiles',
    components: {
      Icon,
    },
  });
</script>

<style scoped>
  .downloaded {
    position: relative;
    padding: 6px 44px 6px 12px;
    background-color: var(--gray100);
    border-radius: var(--pad8);
    display: flex;
    align-items: center;
    height: 32px;
    &:not(:last-child) {
      margin-bottom: 4px;
    }
    & .icon-file {
      margin-right: 14px;
    }
    & .file-name {
      font-size: 12px;
      line-height: 16px;
      color: var(--gray900);
      width: 240px;
      white-space: nowrap;
      position: relative;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    & .icon-delete {
      position: absolute;
      right: 12px;
      cursor: pointer;
    }
  }
</style>
