<template lang="pug">
.nav
  //router-link(to="/") Home
  //router-link(to="/about") About
  //router-link(to="/signin") SignIn
router-view
</template>

<script lang="ts">
  import { defineComponent, onMounted } from 'vue';
  import { $drawer, openDrawer, closeDrawer } from '@/store/drawer';
  import { detectVendor } from '@/helpers/vendor';
  import { useStore } from 'effector-vue/composition';

  export default defineComponent({
    setup() {
      const drawerStore = useStore($drawer);
      const onKeyDown = (ev: KeyboardEvent) => {
        if (ev.altKey && ev.code === 'KeyL') {
          if (!drawerStore.value.opened) {
            openDrawer('changeLayout');
          } else {
            closeDrawer();
          }

          ev.preventDefault();
          ev.cancelBubble = true;
        }
      };

      document.addEventListener('keydown', onKeyDown);

      onMounted(() => {
        detectVendor();
      });
    },
  });
</script>

<style>
  :root {
    --paddingSingle: 6px;
    --paddingDouble: 12px;
    --paddingTriple: 18px;
    --fontInter: 'Inter', sans-serif;
    --fontRoboto: 'Roboto', sans-serif;
    --colorLiteAccent: #d2c2ff;
    --colorGray: #9ba9bb;

    --violet500: #1e0d4c;
    --purple100: #662eff;
    --purple400: #8b55ff;
    --purple500: #662eff;
    --purple600: #5729d0;
    --purple700: #4824a2;
    --purple800: #351877;
    --purple900: #25104f;
    --purple950: #221040;
    --purple955: #1b0d33;
    --gray100: #fafafd;
    --gray200: #eaedf3;
    --gray300: #d8dce6;
    --gray400: #bcc5d1;
    --gray500: #95a2b3;
    --gray600: #8e90a6;
    --gray700: #555770;
    --gray800: #2e283d;
    --gray900: #1f1c28;
    --red: #e50033;
    --green: #008000;
    --shadow500: 0px 28px 64px rgba(28, 11, 67, 0.25);
    --shadowLarge: 0px 4px 8px rgba(149, 162, 179, 0.08), 0px 16px 24px rgba(149, 162, 179, 0.12),
      0px 24px 32px rgba(149, 162, 179, 0.1);
    --shadowMedium: 0px 6px 16px rgba(51, 55, 60, 0.08);
    --shadowBase: 0px 0px 2px rgba(149, 162, 179, 0.1), 0px 4px 8px rgba(149, 162, 179, 0.12);
    --button-transition: background 0.3s ease, border 0.3s ease;
    --shadow-s-base: 0 1px 3px rgba(51, 55, 60, 0.08);
    --pad8: 8px;
    --pad16: 16px;
    --pad20: 20px;
    --pad24: 24px;
    --pad32: 32px;
    --pad40: 40px;
    --pad48: 48px;
    --pad52: 52px;
    --pad56: 56px;
    --pad64: 64px;
    --pad72: 72px;
    --pad80: 80px;
    --pad88: 88px;
    --pad96: 96px;
    --pad100: 100px;
    --pad104: 104px;
    --pad112: 112px;
    --pad120: 120px;
    --pad128: 128px;
    --pad136: 136px;
    --pad144: 144px;

    --dark-lilac: #521dca;
    --purple: #1c0b43;
    --light-gray: #e0e4ea;
    --light-blue: #f7fafe;
    --violet: #8b61ff;
    --white: #fff;
    --pink: #f54b5e;
    --orange: #f5a623;

    --infoGray: #7f8ea1;
    --warningRed: #fae5e8;
    --tipBlue: #f1ecff;
  }

  body * {
    font-family: var(--fontInter);
    line-height: 1.2;
    box-sizing: border-box;
    &::-webkit-scrollbar {
      width: 12px;
    }
    &::-webkit-scrollbar-thumb {
      border: 4px solid rgba(0, 0, 0, 0);
      background-clip: padding-box;
      border-radius: 6px;
      background-color: var(--gray400);
    }
  }

  @custom-media --viewport-s (width >= 768px);

  @custom-media --viewport-m (width >= 992px);

  @custom-media --viewport-l (width >= 1200px);

  @custom-media --viewport-xl (width >= 1440px);

  html,
  body,
  div,
  span,
  applet,
  object,
  iframe,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  blockquote,
  pre,
  a,
  abbr,
  acronym,
  address,
  big,
  cite,
  code,
  del,
  dfn,
  img,
  ins,
  kbd,
  q,
  s,
  samp,
  small,
  strike,
  sub,
  tt,
  var,
  b,
  u,
  i,
  center,
  dl,
  dt,
  dd,
  ol,
  ul,
  li,
  fieldset,
  form,
  label,
  legend,
  table,
  caption,
  tbody,
  tfoot,
  thead,
  tr,
  th,
  td,
  article,
  aside,
  canvas,
  details,
  embed,
  figure,
  figcaption,
  footer,
  header,
  hgroup,
  menu,
  nav,
  output,
  ruby,
  section,
  summary,
  time,
  mark,
  audio,
  video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
  }

  :focus {
    outline: 0;
  }

  article,
  aside,
  details,
  figcaption,
  figure,
  footer,
  header,
  hgroup,
  menu,
  nav,
  section {
    display: block;
  }

  body {
    line-height: 1;
  }

  ul {
    list-style: none;
  }

  blockquote,
  q {
    quotes: none;
  }

  blockquote:before,
  blockquote:after,
  q:before,
  q:after {
    content: '';
    content: none;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-decoration,
  input[type='search']::-webkit-search-results-button,
  input[type='search']::-webkit-search-results-decoration {
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  input[type='search'] {
    -webkit-appearance: none;
    -moz-appearance: none;
    -webkit-box-sizing: content-box;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
  }

  textarea {
    overflow: auto;
    vertical-align: top;
    resize: vertical;
  }

  audio,
  canvas,
  video {
    display: inline-block;
    *display: inline;
    *zoom: 1;
    max-width: 100%;
  }

  audio:not([controls]) {
    display: none;
    height: 0;
  }

  [hidden] {
    display: none;
  }

  html {
    font-size: 100%; /* 1 */
    -webkit-text-size-adjust: 100%; /* 2 */
    -ms-text-size-adjust: 100%; /* 2 */
  }

  a:focus {
    outline: thin dotted;
  }

  a:active,
  a:hover {
    outline: 0;
  }

  img {
    border: 0; /* 1 */
    -ms-interpolation-mode: bicubic; /* 2 */
  }

  figure {
    margin: 0;
  }

  form {
    margin: 0;
  }

  fieldset {
    border: 1px solid #c0c0c0;
    margin: 0 2px;
    padding: 0.35em 0.625em 0.75em;
  }

  legend {
    border: 0; /* 1 */
    padding: 0;
    white-space: normal; /* 2 */
    *margin-left: -7px; /* 3 */
  }

  button,
  input,
  select,
  textarea {
    font-size: 100%; /* 1 */
    margin: 0; /* 2 */
    vertical-align: baseline; /* 3 */
    *vertical-align: middle; /* 3 */
  }

  button,
  input {
    line-height: normal;
  }

  button,
  select {
    text-transform: none;
  }

  button,
  html input[type="button"], /* 1 */
  input[type="reset"],
  input[type="submit"] {
    -webkit-appearance: button; /* 2 */
    cursor: pointer; /* 3 */
    *overflow: visible; /* 4 */
  }

  button[disabled],
  html input[disabled] {
    cursor: default;
  }

  input[type='checkbox'],
  input[type='radio'] {
    box-sizing: border-box; /* 1 */
    padding: 0; /* 2 */
    *height: 13px; /* 3 */
    *width: 13px; /* 3 */
  }

  input[type='search'] {
    -webkit-appearance: textfield; /* 1 */
    -moz-box-sizing: content-box;
    -webkit-box-sizing: content-box; /* 2 */
    box-sizing: content-box;
  }

  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  button::-moz-focus-inner,
  input::-moz-focus-inner {
    border: 0;
    padding: 0;
  }

  textarea {
    overflow: auto;
    vertical-align: top;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  html,
  button,
  input,
  select,
  textarea {
    color: #222;
  }

  ::-moz-selection {
    background: #b3d4fc;
    text-shadow: none;
  }

  ::selection {
    background: #b3d4fc;
    text-shadow: none;
  }

  img {
    vertical-align: middle;
  }

  fieldset {
    border: 0;
    margin: 0;
    padding: 0;
  }

  textarea {
    resize: vertical;
  }

  .chromeframe {
    margin: 0.2em 0;
    background: #ccc;
    color: #000;
    padding: 0.2em 0;
  }
</style>
