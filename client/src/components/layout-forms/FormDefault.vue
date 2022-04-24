<template lang="pug">
.form-default
  .content
    .logo-wrap
      Logo(:size="logoSize")
    Form(:isDefault="true" :title="t('form.join')" :alternative="t('form.signWith')" :textButton="t('form.join')")
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
  .form-default {
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
      margin: 0 auto var(--pad52);
      @media (width >= 768px) {
        width: 157px;
        height: 100px;
        img {
          width: 157px;
          height: 100px;
        }
      }
    }
  }
</style>
