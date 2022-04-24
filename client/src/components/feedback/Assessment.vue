<template lang="pug">
.assessment
  Typography(fontSize="16px" fontColor="var(--sui-gray-800)") {{ t('feedback.assessment.description') }}
  .star-block
    .star(v-for="n of 5")
      Icon(spriteUrl="/image/videoconf-icons.svg" name="star" width="64" height="38" :color="starColor[n]" @click="assess(n)" @mouseover="assessHover(n)" @mouseleave="clearAccess")
  .under-stars-block
    Typography(fontSize="16px" fontColor="var(--sui-gray-600)") {{ t('feedback.assessment.bad') }}
    Typography(fontSize="16px" fontColor="var(--sui-gray-600)") {{ t('feedback.assessment.good') }}
  Button.submit-button(width="fill-container" :disabled="disabled" @click="submitAssessment") {{ t('feedback.assessment.submit') }}
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Button, Typography, Popup, Icon } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'Assessment',
    components: { Button, Typography, Popup, Icon },
    emits: ['update:assessment'],
    setup(props, { emit }) {
      const { t } = useI18n();
      const starColor = ref([
        'var(--sui-gray-200)',
        'var(--sui-gray-200)',
        'var(--sui-gray-200)',
        'var(--sui-gray-200)',
        'var(--sui-gray-200)',
        'var(--sui-gray-200)',
      ]);
      const disabled = ref(true);
      const assessed = ref(-1);
      const assess = (e: number) => {
        assessed.value = e;
        disabled.value = false;
        for (let i = 1; i <= 6; i++) {
          if (e >= i) starColor.value[i] = 'var(--sui-purple-500)';
          else starColor.value[i] = 'var(--sui-gray-200)';
        }
      };
      const assessHover = (e: number) => {
        for (let i = 1; i <= 6; i++) {
          if (e >= i) starColor.value[i] = 'var(--sui-purple-500)';
          else if (e >= assessed.value) starColor.value[i] = 'var(--sui-gray-200)';
        }
      };
      const clearAccess = () => {
        for (let i = 1; i <= 6; i++) {
          if (i > assessed.value) starColor.value[i] = 'var(--sui-gray-200)';
        }
      };
      const submitAssessment = () => {
        emit('update:assessment');
      };

      return {
        t,
        starColor,
        disabled,
        assess,
        assessHover,
        clearAccess,
        submitAssessment,
      };
    },
  });
</script>

<style scoped>
  .assessment {
    margin-top: 124px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .star-block {
    margin-top: 24px;
    max-width: 296px;
    display: flex;
    justify-content: space-between;
  }
  .star {
    width: 64px;
  }
  .under-stars-block {
    display: flex;
    width: 296px;
    justify-content: space-between;
    margin-top: 16px;
  }
  .submit-button {
    margin-top: 150px;
  }
</style>
