<template lang="pug">
.feedback
  TabbedPage(:tabs="tabs" :pages="pages")
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { TabbedPage, Button } from '@voximplant/spaceui';
  import FeedbackTab from '@/components/feedback/FeedbackTab.vue';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'Feedback',
    components: { TabbedPage, FeedbackTab, Button },
    setup() {
      const { t } = useI18n();
      const tabs = [
        { title: t('feedback.category.video.title') },
        { title: t('feedback.category.audio.title') },
        { title: t('feedback.category.presentation.title') },
        { title: t('feedback.category.other.title') },
      ];
      const props = [
        {
          items: [
            { id: 'video-1', value: t('feedback.category.video.notInSync'), isChecked: false },
            { id: 'video-2', value: t('feedback.category.video.breakingUp'), isChecked: false },
            { id: 'video-3', value: t('feedback.category.video.blurry'), isChecked: false },
            { id: 'video-4', value: t('feedback.category.video.notSee'), isChecked: false },
            { id: 'video-5', value: t('feedback.category.video.cameraTrouble'), isChecked: false },
            { id: 'video-6', value: t('feedback.category.video.other'), isChecked: false },
          ],
        },
        {
          items: [
            { id: 'audio-1', value: t('feedback.category.audio.notHearMe'), isChecked: false },
            { id: 'audio-2', value: t('feedback.category.audio.breakingUp'), isChecked: false },
            { id: 'audio-3', value: t('feedback.category.audio.delayed'), isChecked: false },
            { id: 'audio-4', value: t('feedback.category.audio.echo'), isChecked: false },
            { id: 'audio-5', value: t('feedback.category.audio.notHearOthers'), isChecked: false },
            { id: 'audio-6', value: t('feedback.category.audio.others'), isChecked: false },
          ],
        },
        {
          items: [
            {
              id: 'presentation-1',
              value: t('feedback.category.presentation.blurry'),
              isChecked: false,
            },
            {
              id: 'presentation-2',
              value: t('feedback.category.presentation.slowUpdate'),
              isChecked: false,
            },
            {
              id: 'presentation-3',
              value: t('feedback.category.presentation.notSee'),
              isChecked: false,
            },
            {
              id: 'presentation-4',
              value: t('feedback.category.presentation.notPresent'),
              isChecked: false,
            },
            {
              id: 'presentation-5',
              value: t('feedback.category.presentation.other'),
              isChecked: false,
            },
          ],
        },
        { items: [] },
      ];
      const pages = tabs.map((_tab, index) => ({
        component: FeedbackTab,
        props: {
          items: props[index],
        },
        methods: {},
      }));

      return {
        tabs,
        pages,
      };
    },
  });
</script>

<style scoped>
  .feedback {
    &::v-deep(.sui-tab-content) {
      height: 16px;
    }
  }
</style>
