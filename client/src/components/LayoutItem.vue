<template lang="pug">
.layout-item(v-if="!isMobileScreen")
  .radio-btn
    RadioButton(:label="name" size="m" :value="type" name="layout" :modelValue="active" @update:modelValue="onRadioSelect")
  .layout-description {{ description }}
  .layout-screen
    img(v-bind="{src: layoutScreen}")
.layout-item-mobile(v-else)
  .layout-screen
    img(v-bind="{src: layoutScreen}")
  .description
    .title {{name}}
    .text {{description}}
  .radio-btn
    RadioButton(:value="type" size="l" name="layout" :modelValue="active" @update:modelValue="onRadioSelect")
</template>

<script lang="ts">
  import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
  import { RadioButton } from '@voximplant/spaceui';
  import { useIsMobileScreen } from '@/hooks/useIsMobile';

  export default defineComponent({
    components: {
      RadioButton,
    },
    emits: ['active'],
    props: {
      name: {
        type: String,
      },
      type: {
        type: String,
      },
      description: {
        type: String,
      },
      layoutScreen: {
        type: String,
      },
      active: {
        type: String,
      },
    },

    setup(props, { emit }) {
      let windowWidth = ref(window.innerWidth);
      const onWidthChange = () => (windowWidth.value = window.innerWidth);
      onMounted(() => window.addEventListener('resize', onWidthChange));
      onUnmounted(() => window.removeEventListener('resize', onWidthChange));
      const { isMobileScreen } = useIsMobileScreen();

      const onRadioSelect = () => {
        emit('active', props.name);
      };

      return { onRadioSelect, isMobileScreen };
    },
  });
</script>

<style scoped>
  .layout-item {
    position: relative;
    padding: 0 16px 0 16px;
    left: 0;
    margin-top: 32px;
    overflow-x: hidden;
    & .layout-description {
      position: relative;
      margin: 4px 24px 11px 24px;
      width: 260px;
      font-family: var(--fontRoboto);
      font-style: normal;
      font-weight: normal;
      font-size: 12px;
      line-height: 16px;
      text-align: left;
      color: var(--gray600);
    }
    & .layout-screen {
      position: relative;
      width: 260px;
      height: 145px;
      left: 24px;
      border-radius: 12px;
    }
    & img {
      width: 260px;
      height: 145px;
    }
    & .radio-btn {
      & .sui-radio-input {
        margin: 2px;
      }
    }
  }
  .layout-item-mobile {
    position: relative;
    padding: 18px 24px 18px 16px;
    width: 100%;
    height: 160px;
    background: #ffffff;
    box-shadow: inset 0 -1px 0 #ebedf2;
    & .description {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 50%;
      left: 110px;
    }
    & .title {
      font-family: var(--fontRoboto);
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      color: var(--gray800);
      margin-bottom: 4px;
    }
    & .text {
      font-family: var(--fontRoboto);
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      color: var(--gray600);
    }
    & .radio-btn {
      position: absolute;
      padding-right: 24px;
      top: 50%;
      transform: translateY(-50%);
      & .sui-radio-button {
        height: 160px;
        width: 100%;
        grid-gap: 0 24px;
        grid-template-areas:
          'label radio'
          '. caption';
        grid-template-columns: 29fr 1fr;
      }
      & .sui-radio-label {
        height: 157px;
      }
      & .sui-radio-input {
        margin: 2px;
      }
    }
  }
</style>
