<template lang="pug">
.feedback-tab
  Typography.header(fontType="header" fontSize="500") {{ t('feedback.category.other.description') }}
  .items(v-if="items.items.length")
    Checkbox(v-for="item in refItems" :label="item.value" :id="item.id" size="l" @update:modelValue="checked($event, item)" :modelValue="item.isChecked")
  .text-input(v-else)
    Textarea(:placeholder="t('feedback.category.other.placeholder')" v-model:modelValue="userComments")
  Button.submit-button(width="fill-container" :disabled="disabled" @click="submitFeedback") {{ t('feedback.submit') }}
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { Typography, Checkbox, Textarea, Button } from '@voximplant/spaceui';
  import { togglePopup } from '@/store/popup';
  import { closeDrawer } from '@/store/drawer';
  import { useI18n } from 'vue-i18n';

  interface Item {
    id: string;
    value: string;
    isChecked: boolean;
  }

  export default defineComponent({
    name: 'FeedbackTab',
    components: { Typography, Checkbox, Textarea, Button },
    props: {
      items: {
        type: Object,
      },
    },
    setup(props) {
      const { t } = useI18n();
      const refItems = ref(props.items?.items);
      watch(props, (newProps) => {
        refItems.value = newProps.items?.items;
      });
      const disabled = ref(true);
      const checkedItems = new Map();
      const checked = (event: boolean, item: Item) => {
        item.isChecked = event;
        if (item.isChecked) {
          checkedItems.set(item.id, item.value);
        } else {
          checkedItems.delete(item.id);
        }
        disabled.value = !checkedItems.size;
      };
      const userComments = ref('');
      watch(userComments, (text) => {
        disabled.value = !text;
      });
      const submitFeedback = () => {
        closeDrawer();
        togglePopup(false);
        console.log(checkedItems);
        console.log(userComments.value);
      };

      return {
        t,
        refItems,
        disabled,
        checked,
        userComments,
        submitFeedback,
      };
    },
  });
</script>

<style scoped>
  .feedback-tab {
    display: flex;
    flex-direction: column;
  }
  .header {
    margin-bottom: 24px;
    margin-top: 24px;
  }
  .items {
    min-height: 264px;
    display: flex;
    flex-direction: column;
    &::v-deep(.sui-label) {
      font-size: 16px;
      color: var(--sui-gray-800);
    }
    &::v-deep(.sui-checkbox) {
      grid-gap: 0 8px;
      margin-bottom: 20px;
    }
  }

  .text-input {
    &::v-deep(.sui-textarea) {
      height: 240px;
    }
  }
  .submit-button {
    margin-top: 10px;
  }
</style>
