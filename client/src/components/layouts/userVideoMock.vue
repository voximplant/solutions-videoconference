<template lang="pug">
.video-mock
  p.name(v-html="mockName")
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'userVideoMock',
    props: {
      name: {
        type: String,
        default: 'No name',
      },
    },
    setup(props) {
      const surnameIndex = props.name.indexOf(' ') + 1;
      const firstSurnameLetter = surnameIndex ? props.name.substr(surnameIndex, 1) : '';
      const mockName = props.name.substr(0, 1) + firstSurnameLetter;

      return {
        mockName,
      };
    },
  });
</script>

<style scoped>
  .video-mock {
    display: flex;
    width: 100%;
    height: 100%;
    background: var(--gray800);
    border-radius: 12px;
  }
  .name {
    @media (width < 768px) {
      border-radius: var(--pad8);
      height: 42px;
      width: 42px;
      font-size: 24px;
    }
    @media (width >= 768px) {
      border-radius: var(--pad8);
      height: 60px;
      width: 60px;
      font-size: 36px;
    }
    @media (width >= 1200px) {
      border-radius: var(--pad8);
      height: 131px;
      width: 131px;
      font-size: 48px;
    }
    display: flex;
    flex-direction: column;
    color: var(--sui-gray-100);
    text-transform: uppercase;
    justify-content: center;
    text-align: center;
    margin: auto;
    background-color: var(--sui-gray-700);
    border-radius: 32px;
  }
</style>
