<template lang="pug">
.video-mock
  .mockBlock
    .usersBlock(:class="blockClasses")
      p.name(v-for="(user) in lastUsers" v-html="mockName(user.stream.title.label)" )
    p.usersCount {{ endpointsMedia.length - index }} {{ t('others') }}
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { useStore } from 'effector-vue/composition';
  import { useI18n } from 'vue-i18n';
  import { $convertedMedia } from '@/store/endpointMedia';

  export default defineComponent({
    name: 'usersOverflowMock',
    props: {
      users: {
        type: Array,
      },
      index: {
        type: Number,
        default: 0,
      },
    },
    setup(props) {
      const { t } = useI18n();
      const mockName = (name: string) => {
        const surnameIndex = name.indexOf(' ') + 1;
        const firstSurnameLetter = surnameIndex ? name.substr(surnameIndex, 1) : '';
        return name.substr(0, 1) + firstSurnameLetter;
      };
      const endpointsMedia = useStore($convertedMedia);
      const lastUsers = computed(() => {
        if (!endpointsMedia?.value.length) return [];
        return endpointsMedia?.value?.slice(props.index, props.index + 3);
      });

      const blockClasses = computed(() => [
        { twoOther: lastUsers.value.length === 2 },
        { threeOther: lastUsers.value.length === 3 },
      ]);

      return {
        t,
        mockName,
        lastUsers,
        endpointsMedia,
        blockClasses,
      };
    },
  });
</script>

<style scoped>
  .video-mock {
    display: flex;
    cursor: pointer;
    flex-direction: row;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--gray800);
    border-radius: 12px;
  }
  .mockBlock {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    align-items: center;
    margin: auto;
    width: auto;
    min-width: 62%;
    height: 64%;
  }
  .usersCount {
    color: var(--sui-white);
    font-size: 14px;
    line-height: 20px;
  }
  .usersBlock {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    position: relative;
    width: 100%;
    max-width: 150px;
    overflow: hidden;
    height: 60px;
    margin-bottom: var(--pad16);

    @media (width <= 768px) {
      font-size: 24px;
      line-height: 28px;
      max-width: 92px;
      height: 42px;
      margin-bottom: var(--pad8);
    }
  }
  .twoOther {
    @media (width >= 768px) {
      :nth-child(1) {
        left: 10%;
      }
      :nth-child(2) {
        left: 41%;
      }
    }
    @media (width < 768px) {
      :nth-child(1) {
        left: 10%;
      }
      :nth-child(2) {
        left: 41%;
      }
    }
  }
  .threeOther {
    @media (width >= 768px) {
      :nth-child(1) {
        left: 0;
      }
      :nth-child(2) {
        left: 26%;
      }
      :nth-child(3) {
        left: 52%;
      }
    }
    @media (width < 768px) {
      :nth-child(1) {
        left: 0;
      }
      :nth-child(2) {
        left: 26%;
      }
      :nth-child(3) {
        left: 52%;
      }
    }
  }
  .name {
    position: absolute;
    border-left: 4px solid var(--gray800);
    border-bottom: 4px solid var(--gray800);
    border-top: 4px solid var(--gray800);
    @media (width <= 768px) {
      border-radius: 12px;
      height: 42px;
      width: 42px;
      font-size: 24px;
    }
    @media (width >= 768px) {
      border-radius: 12px;
      height: 60px;
      width: 60px;
      font-size: 36px;
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
