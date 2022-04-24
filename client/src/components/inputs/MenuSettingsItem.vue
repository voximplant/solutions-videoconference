<template lang="pug">
.menu-item(:class="{'disabled': isDisabled}")
  .item-wrap
    Icon.icon(
      spriteUrl="/image/videoconf-icons.svg"
      :name="icon"
      :color="color"
    )
    p.item-title {{ title }}
  Icon.chevron(
    v-if="isActivated" 
    name="ic20-chevron-right"
    color="--sui-gray-400"
  )
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Icon } from '@voximplant/spaceui';

  export default defineComponent({
    name: 'MenuSettingsItem',
    components: {
      Icon,
    },
    props: {
      icon: {
        type: String,
        default: 'ic25-settings-on',
      },
      title: {
        type: String,
        required: true,
      },
      isDisabled: {
        type: Boolean,
        default: false,
      },
      isActivated: {
        type: Boolean,
        default: true,
      },
      color: {
        type: String,
        default: '--sui-purple-500',
      },
    },
  });
</script>

<style scoped>
  .menu-item {
    font-family: var(--fontRoboto);
    color: var(--gray900);
    cursor: pointer;
    width: 100%;
    padding: var(--pad16) 18px var(--pad16) var(--pad16);
    display: flex;
    justify-content: space-between;
    box-shadow: inset 0 -1px 0 #ebedf2;
    & .item-wrap {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
    & .icon {
      margin-right: 12px;
    }
    & .item-title {
      font-size: var(--pad16);
      line-height: var(--pad20);
    }
  }
  .disabled {
    color: var(--gray500);
    background: var(--gray100);
  }
</style>
