<template lang="pug">
.radio-input
  input(type="radio" :id="item" :value="item" :name="name" :checked="checked")
  label.radio-input-wrap(:for="item" tabindex="0") {{ label || item}}
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'RadioInput',
    components: {},
    props: {
      item: {
        type: String,
      },
      label: {
        type: String,
      },
      name: {
        type: String,
        default: 'radio',
      },
      checked: {
        type: Boolean,
      },
    },
  });
</script>

<style scoped>
  .radio-input {
    font-family: var(--fontRoboto);
    height: fit-content;
    & .radio-input-wrap {
      display: block;
      padding: 18px var(--pad16);
      font-size: var(--pad16);
      line-height: var(--pad20);
      color: var(--gray900);
      width: 100%;
      position: relative;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    & input {
      display: none;
    }
    & input:checked ~ .radio-input-wrap {
      color: var(--purple500);
      background-color: var(--gray100);
      box-shadow: inset 0 -1px 0 #ebedf2;
      &::after {
        position: absolute;
        content: '';
        width: var(--pad24);
        height: var(--pad24);
        background: url('../../assets/images/icon/check.svg');
        right: var(--pad16);
        top: var(--pad16);
      }
    }
  }
</style>
