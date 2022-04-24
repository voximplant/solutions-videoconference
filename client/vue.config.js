// eslint-disable-next-line @typescript-eslint/no-var-requires
const PostcssPresetEnv = require('postcss-preset-env');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PostcssCustomMedia = require('postcss-custom-media');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require('postcss-nested'),
          PostcssPresetEnv({
            stage: 3,
            browsers: '> 1%',
          }),
          PostcssCustomMedia({
            importFrom: [
              {
                customMedia: {
                  '--viewport-s': '(width >= 768px)',
                  '--viewport-m': '(width >= 992px)',
                  '--viewport-l': '(width >= 1200px)',
                  '--viewport-xl': '(width >= 1440px)',
                },
              },
            ],
          }),
        ],
      },
    },
  },
  configureWebpack: {
    resolve: {
      symlinks: false,
      alias: {
        vue: path.resolve('./node_modules/vue'),
      },
    },
  },
};
