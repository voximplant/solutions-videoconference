<template lang="pug">
.toggle(:class="{'disable': isDisabled }")
  input.toggle-button(
    :class="size"
    type="checkbox"
    :id="value"
    :disabled="isDisabled"
    )
  // label.text(for="toggle-button") {{ text }}
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'Toggle',
    components: {},
    props: {
      isDisabled: {
        type: Boolean,
        default: false,
      },
      id: {
        type: Number,
        default: 0,
      },
      text: {
        type: String,
        default: '',
      },
      size: {
        type: String,
        default: 'size-s',
      },
    },
  });
</script>

<style scoped>
  .toggle {
    font-family: var(--fontRoboto);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-height: var(--pad20);
    & .toggle-button {
      position: relative;
      display: inline-block;
      width: 32px;
      height: 16px;
      padding: 2px;
      margin: 0 var(--pad8) 0 0;
      vertical-align: top;
      background: var(--gray300);
      border-radius: 100px;
      outline: none;
      cursor: pointer;
      appearance: none;
      &:hover {
        background: var(--gray400);
      }
      &::after {
        content: '';
        display: inline-block;
        position: absolute;
        width: 12px;
        height: 12px;
        background-color: var(--white);
        border-radius: 50%;
        transform: translateX(0);
        transition: all 0.3s cubic-bezier(0.2, 0.85, 0.32, 1.2);
      }
      &:checked::after {
        transform: translateX(calc(100% + 4px));
      }
      &:checked {
        background-color: var(--purple500);
      }
      &:checked:hover {
        background-color: var(--purple600);
      }
      &:focus {
        box-shadow: 0 0 0 2px var(--sui-blue-500);
      }
    }
    .text {
      font-size: 14px;
      line-height: var(--pad20);
      color: var(--gray800);
    }
    & .size-m {
      width: 48px;
      height: 24px;
      padding: 4px;
      &::after {
        width: 16px;
        height: 16px;
      }
      &:checked::after {
        transform: translateX(calc(100% + 8px));
      }
    }
  }
  .disable {
    opacity: 30%;
    & .toggle-button {
      &:hover {
        background-color: var(--gray300);
      }
      &:checked:hover {
        background-color: var(--purple500);
      }
    }
  }
</style>
