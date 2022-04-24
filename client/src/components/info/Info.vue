<template lang="pug">
.info(v-if="isShow")
  .img-wrap
    Icon.icon( 
      :spriteUrl="link"
      :name="iconName"
    )
  h3.title {{ title }}
  p.text {{ text }}
    // a.popup(href="#") Need help?
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { Icon } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'Info',
    components: {
      Icon,
    },

    props: {
      isShow: {
        type: Boolean,
        default: false,
        required: false,
      },
      link: {
        type: String,
        default: '/image/videoconf-icons.svg',
        required: false,
      },
      iconName: {
        type: String,
        default: 'ic36-info-fill-blue',
        required: false,
      },
      errorInfo: {
        type: String,
        required: false,
      },
    },
    setup(props) {
      const { t } = useI18n();
      let title = ref(t('error.default.title'));
      let text = ref(t('error.default.description'));
      watch(props, () => {
        switch (props.errorInfo) {
          case 'browserPermission':
            title.value = t('error.browserPermission.title');
            text.value = t('error.browserPermission.description');
            return { title, text };
          case 'noCamera':
            title.value = t('error.noCamera.title');
            text.value = t('error.noCamera.description');
            return { title, text };
          case 'AbortError':
            title.value = t('error.abortError.title');
            text.value = t('error.abortError.description');
            return { title, text };
        }
      });
      return {
        title,
        text,
      };
    },
  });
</script>

<style scoped>
  .info {
    max-width: 500px;
    padding: 0 var(--pad8);
    font-family: var(--fontRoboto);
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    margin: 0 auto;
    & .img-wrap {
      margin-bottom: var(--pad32);
      @media (width >= 768px) {
        margin-bottom: 22px;
      }
      @media (width >= 1200px) {
        margin-bottom: var(--pad32);
      }
    }
    & .icon {
      width: 36px;
      height: 36px;
    }
    & .title {
      font-weight: 500;
      font-size: var(--pad16);
      line-height: var(--pad20);
      color: var(--gray900);
      margin-bottom: var(--pad8);
      @media (width >= 768px) {
        font-size: 14px;
        line-height: var(--pad16);
      }
      @media (width >= 1200px) {
        font-size: var(--pad16);
        line-height: var(--pad20);
      }
    }
    & .text {
      color: var(--gray700);
      @media (width >= 768px) {
        font-size: 12px;
        line-height: var(--pad16);
      }
      @media (width >= 1200px) {
        font-size: 14px;
        line-height: var(--pad20);
      }
    }
    & .popup {
      text-decoration: underline;
      color: var(--purple500);
    }
  }
</style>
