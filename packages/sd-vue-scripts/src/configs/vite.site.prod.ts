import vueDocs from '@sd-design/vite-plugin-sd-vue-docs';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';
import { defineConfig } from 'vite';
import svgLoader from 'vite-svg-loader';

import paths from '../utils/paths';

const root = process.cwd();

const base = process.env.AssetsPublicPath || 'https://sd.design/vue/';

export default defineConfig({
  mode: 'production',
  base,
  css: {
    preprocessorOptions: {
      less: {
        paths: [paths.resolvePath('../web-vue')],
      },
    },
  },
  resolve: {
    alias: [
      {
        find: /^@web-vue\/(.*)/,
        replacement: path.resolve(root, '../web-vue/$1'),
      },
    ],
  },
  build: {
    target: 'es2015',
  },
  plugins: [vueDocs(), vue(), vueJsx(), svgLoader({ svgoConfig: {} })],
});
