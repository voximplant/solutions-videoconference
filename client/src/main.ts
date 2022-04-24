import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { SpaceUIPlugin } from '@voximplant/spaceui';
import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';

const messages = {
  en: en,
  es: {
    signIn: {
      title: 'Iniciar sesión',
    },
  },
};
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

const spaceUiPlugin = SpaceUIPlugin({
  spriteUrl: require(`@voximplant/spaceui/common/sui-icons.svg`),
});

createApp(App).use(i18n).use(router).use(spaceUiPlugin).mount('#app');
