<template lang="pug">
.tooltip-wrap(:class="{ 'opened-popup': openedPopup || justClosedPopup }" @mouseenter="isMouseOver = true" @mouseleave="onMouseLeave")
  .tooltip
   span.text {{ text }}
  .button
    slot(name="button")
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { Button } from '@voximplant/spaceui';
  import { isPopupOpened } from '@/store/popup';
  import { useStore } from 'effector-vue/composition';

  export default defineComponent({
    name: 'Tooltip',
    components: {
      Button,
    },
    props: {
      text: {
        type: String,
      },
    },
    setup() {
      const openedPopup = useStore(isPopupOpened);
      const justClosedPopup = ref(false);
      watch(openedPopup, (opened) => {
        if (!opened) {
          if (isMouseOver.value) {
            justClosedPopup.value = true;
          }
        }
      });
      const isMouseOver = ref(false);
      const onMouseLeave = () => {
        isMouseOver.value = false;
        justClosedPopup.value = false;
      };
      return {
        openedPopup,
        isMouseOver,
        onMouseLeave,
        justClosedPopup,
      };
    },
  });
</script>

<style scoped>
  .tooltip-wrap {
    font-family: var(--fontRoboto);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    & .tooltip {
      display: none;
      @media (width >= 768px) {
        max-width: 180px;
        opacity: 0;
        display: block;
        text-align: center;
        font-size: 14px;
        line-height: 20px;
        color: var(--white);
        background-color: var(--gray900);
        border-radius: 4px;
        padding: 2px 6px;
        position: absolute;
        width: max-content;
        bottom: calc(100% + 7px);
        transition: opacity 0.2s ease-in;
      }
      &::after {
        position: absolute;
        content: '';
        border: 5px solid transparent;
        border-top: 5px solid var(--gray900);
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
  .tooltip-wrap:not(.opened-popup) {
    &:hover .tooltip {
      z-index: 0;
      opacity: 1;
      transition: opacity 0.2s ease-in;
    }
  }
</style>
