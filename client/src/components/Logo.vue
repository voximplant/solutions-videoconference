<template lang="pug">
.logo
  img(:src="sizes[size]" alt="Videoconf")
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';

  interface LogoSizes {
    small?: string;
    medium?: string;
    large?: string;
  }

  const sizes: LogoSizes = {
    small: require('../assets/images/logo-small.svg'),
    medium: require('../assets/images/logo-medium.svg'),
    large: require('../assets/images/logo-large.svg'),
  };

  export default defineComponent({
    name: 'Logo',
    components: {},

    props: {
      size: {
        type: String as PropType<keyof LogoSizes>,
        required: true,
      },
    },

    setup() {
      return {
        sizes,
      };
    },
  });
</script>

<style scoped>
  .logo {
    img {
      width: 100%;
      height: auto;
    }
  }
</style>
