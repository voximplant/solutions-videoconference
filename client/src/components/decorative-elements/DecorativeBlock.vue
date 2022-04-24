<template lang="pug">
.decorative-block
  .element
    .text-wrap
      h2.title {{ t('join.title') }}
      p.description {{ t('join.description') }}
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'DecorativeBlock',
    components: {},
    setup() {
      const { t } = useI18n();
      return {
        t,
      };
    },
  });
</script>

<style scoped>
  .decorative-block {
    display: none;
    font-family: var(--fontRoboto);
    @media (width >= 992px) {
      display: block;
      height: 100%;
      order: 0;
      flex: 0 1 auto;
      align-self: auto;
    }
    & .element {
      @media (width >= 992px) {
        width: 481px;
        height: 100%;
        background: url('../../assets/images/sign-in-background-mid.png') var(--purple955) no-repeat;
        background-size: 100% auto;
      }
      @media (width >= 1440px) {
        width: 785px;
        height: 100%;
        background-image: url('../../assets/images/sign-in-background-big.png');
      }
    }
    & .text-wrap {
      display: none;
      @media (width >= 992px) {
        display: block;
        width: fit-content;
        padding: 70px 40px;
      }
      @media (width >= 1440px) {
        padding: 50px 0;
        margin: 0 auto;
      }
    }
    & .title {
      font-weight: 500;
      font-size: 36px;
      line-height: 40px;
      color: var(--white);
      margin-bottom: 12px;
      @media (width >= 1440px) {
        text-align: center;
      }
    }
    & .description {
      color: var(--gray500);
      font-size: 20px;
      line-height: 24px;
      @media (width >= 1440px) {
        text-align: center;
      }
    }
  }
</style>
