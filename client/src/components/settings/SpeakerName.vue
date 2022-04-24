<template lang="pug">
.name
  span.text {{ name }}
  SpeakerButton(v-if="!isStartSettings" :isAdmin="false" :endpointId="endpointId" :hasVideo='hasVideo')
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import SpeakerButton from '@/components/panel-buttons/SpeakerButton.vue';

  export default defineComponent({
    name: 'SpeakerName',
    components: {
      SpeakerButton,
    },
    props: {
      name: {
        type: String,
        default: 'Jane Cooper',
      },
      isStartSettings: {
        type: Boolean,
        default: false,
      },
      hasVideo: {
        type: Boolean,
        default: false,
      },
      endpointId: {
        type: String,
        default: 'local',
      },
    },
  });
</script>

<style scoped>
  .name {
    font-family: var(--fontRoboto);
    border-radius: 4px;
    background-color: rgba(31, 28, 40, 0.7);
    display: flex;
    align-items: center;
    & .text {
      display: inline-block;
      color: var(--white);
      font-size: 14px;
      line-height: 20px;
      padding: 0 6px;
      @media (width >= 768px) {
        padding: 0 4px 0 6px;
      }
    }
  }
</style>
