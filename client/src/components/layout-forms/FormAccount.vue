<template lang="pug">
.form-account
  .content
    .logo-wrap
      Logo(:size="logoSize")
    Form(:isAccount="true" :title="t('form.signIn')" :textButton="t('form.start')")
  DecorativeBlock
</template>

<script lang="ts">
  import Logo from '@/components/Logo.vue';
  import { defineComponent } from 'vue';
  import DecorativeBlock from '@/components/decorative-elements/DecorativeBlock.vue';
  import Form from '@/components/forms/FormSignIn.vue';
  import { useLogoSize } from '@/hooks/useLogoSize';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'FormJoin',
    components: {
      Form,
      Logo,
      DecorativeBlock,
    },

    setup() {
      const { t } = useI18n();
      const { logoSize } = useLogoSize();
      return {
        t,
        logoSize,
      };
    },
  });
</script>

<style scoped>
  .form-account {
    display: flex;
    align-items: center;
    height: 100vh;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    & .content {
      align-self: center;
      margin: 0 auto;
      width: 100%;
      padding: 0 var(--pad24);
    }
    .logo-wrap {
      width: 115px;
      height: 76px;
      margin: 0 auto 140px;
      @media (width >= 768px) {
        width: 157px;
        height: 100px;
        margin-bottom: 118px;
        img {
          width: 157px;
          height: 100px;
        }
      }
    }
  }
</style>
