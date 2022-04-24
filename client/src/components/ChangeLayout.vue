<template lang="pug">
.change-layout(v-if="!isMobileScreen")
  .description-container
    span.title {{ t('layout.change') }}
    .description {{ t('layout.description') }}
    // Select.selected(:options="selectOptions" v-model:modelValue="activeItem")
.change-layout-mobile(v-else="isMobileScreen")
  .header
    .title {{ t('menuList.changeLayout') }}
    Button.done-btn(size="s" mode="flat" @click="closeDrawer") {{ t('done') }}
.layout-container
    LayoutItem(
      v-if="!isMobileScreen"
      v-for="item in activeItem.layoutItems"
      :key="item.name"
      :name="item.name"
      :description="item.description"
      :layoutScreen="item.layoutScreen"
      :type="item.type"
      :active="layoutType"
      @active="onSelectActive(item.type)"
    )
    LayoutItem(
      v-if="isMobileScreen"
      v-for="mobileItem in layoutItemsMobile"
      :key="mobileItem.name"
      :name="mobileItem.name"
      :description="mobileItem.description"
      :layoutScreen="mobileItem.layoutScreen"
      :type="mobileItem.type"
      :active="layoutType"
      @active="onSelectActive(mobileItem.type)"
      )
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';
  import LayoutItem from '@/components/LayoutItem.vue';
  import { closeDrawer } from '@/store/drawer';
  import { useIsMobileScreen } from '@/hooks/useIsMobile';
  import { Select, Button } from '@voximplant/spaceui';
  import { useStore } from 'effector-vue/composition.cjs';
  import { useI18n } from 'vue-i18n';
  import { $layoutType, changeLayoutType } from '@/store/layout';
  import { LayoutType } from '@/helpers/layouts';

  interface LayoutSubType {
    name: string;
    description: string;
    layoutScreen: string;
    // type: AreaStore;
    type: string;
  }

  interface LayoutOptions {
    label: string;
    value: string;
    layoutItems: LayoutSubType[];
  }
  export default defineComponent({
    components: { LayoutItem, Select, Button },
    setup() {
      const { t } = useI18n();
      const layoutItems: LayoutOptions[] = [
        {
          label: 'Default',
          value: 'Default',
          layoutItems: [
            {
              name: t('layout.types.grid.name'),
              description: t('layout.types.grid.description'),
              layoutScreen: require('@/assets/landscape_layout.png'),
              type: 'grid',
            },
            {
              name: t('layout.types.tribune.name'),
              description: t('layout.types.tribune.description'),
              layoutScreen: require('@/assets/education_layout_name1.png'),
              type: 'tribune',
            },
            {
              name: t('layout.types.demonstration.name'),
              description: t('layout.types.demonstration.description'),
              layoutScreen: require('@/assets/demonstration.png'),
              type: 'demonstration',
            },
          ],
        },
        /*{
          label: 'Education',
          value: 'Education',
          layoutItems: [
            {
              name: 'Layout name',
              description: ' Description layout text goes here Help or instruction text goes here ',
              layoutScreen: require('@/assets/education_layout_name1.png'),
              type: 'demonstration',
            },
            {
              name: 'Whiteboard mode',
              description: 'Enables you to focus attention on the whiteboard.',
              layoutScreen: require('@/assets/whiteboard_mode.png'),
              type: 'demonstration',
            },
            {
              name: 'Layout name',
              description: ' Description layout text goes here Help or instruction text goes here ',
              layoutScreen: require('@/assets/education_layout_name3.png'),
              type: 'demonstration',
            },
          ],
        },*/
        /*{
          label: 'Webinars',
          value: 'Webinars',
          layoutItems: [
            {
              name: 'Layout name',
              description: ' Description layout text goes here Help or instruction text goes here ',
              layoutScreen: require('@/assets/webinars_layout1.png'),
              type: 'demonstration',
            },
            {
              name: 'Layout name',
              description: 'Description layout text goes here Help or instruction text goes here',
              layoutScreen: require('@/assets/webinars_layout2.png'),
              type: 'demonstration',
            },
          ],
        },*/
      ];
      const layoutItemsMobile: LayoutSubType[] = [
        /*{
          name: '2 users on screen',
          description: 'The screen always shows 2 equal users max with scroll',
          layoutScreen: require('@/assets/2users_layout_mobile.png'),
          type: 'demonstration',
        },
        {
          name: '4 users on screen',
          description: 'The screen always shows 2 equal users max with scroll',
          layoutScreen: require('@/assets/4users_layout_mobile.png'),
          type: 'demonstration',
        },*/
        {
          name: t('layout.types.grid.name'),
          description: t('layout.types.grid.description'),
          layoutScreen: require('@/assets/6users_layout_mobile.png'),
          type: 'grid',
        },
        {
          name: t('layout.types.tribune.name'),
          description: t('layout.types.tribune.description'),
          layoutScreen: require('@/assets/fullscreen_layout_mobile.png'),
          type: 'tribune',
        },
        {
          name: t('layout.types.demonstration.name'),
          description: t('layout.types.demonstration.description'),
          layoutScreen: require('@/assets/default_layout_mobile.png'),
          type: 'demonstration',
        },
      ];
      const layoutType = useStore($layoutType);
      const activeItem = ref(layoutItems[0]);
      const activeLayout = ref<string | null>(layoutItems[0].layoutItems[0].name);
      const activeLayoutMobile = ref<string | null>(layoutItemsMobile[0].name);
      const content = ref(layoutItems);
      const { isMobileScreen } = useIsMobileScreen();

      const onSelectActive = (type: LayoutType) => {
        changeLayoutType(type);
      };
      onMounted(() => {
        activeLayout.value = layoutType.value;
      });
      return {
        layoutType,
        closeDrawer,
        content,
        activeItem,
        activeLayout,
        layoutItemsMobile,
        onSelectActive,
        activeLayoutMobile,
        isMobileScreen,
        t,
      };
    },
  });
</script>

<style scoped>
  .change-layout {
    & .description-container {
      padding: 0 16px 0 16px;
    }
    & .title {
      position: relative;
      font-family: var(--fontRoboto);
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      display: flex;
      align-items: center;
      color: var(--gray900);
    }
    & .description {
      position: relative;
      width: 312px;
      height: 60px;
      margin-top: 10px;
      font-family: var(--fontRoboto);
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      text-align: left;
      color: #000000;
    }
    & .selected .sui-select-head {
      width: 308px;
      height: 40px;
      font-family: var(--fontRoboto);
    }
  }
  .layout-container {
    width: 100%;
    height: calc(100vh - 120px);
    overflow-y: scroll;
    @media (width >= 768px) {
      height: auto;
      overflow-y: auto;
    }
  }
  .change-layout-mobile {
    & .layouts-container {
    }
    & .header {
      position: relative;
      display: flex;
      justify-content: space-between;
      margin: 24px 4px 12px 16px;
    }
    & .title {
      position: relative;
      font-family: var(--fontRoboto);
      font-style: normal;
      font-weight: 500;
      font-size: 24px;
      line-height: 28px;
      color: var(--gray800);
    }
    & .done-btn {
      & .sui-button-content {
        font-family: var(--fontRoboto);
        font-size: 16px;
        font-weight: normal;
        line-height: 20px;
      }
    }
  }
</style>
