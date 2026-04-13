import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig, InlineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

import external from '../plugins/vite-plugin-external';

export default defineConfig({
  mode: 'development',
  build: {
    target: 'es2015',
    outDir: 'es',
    emptyOutDir: true,
    minify: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        preserveModules: true,
        preserveModulesRoot: 'components',
      },
    },
    lib: {
      entry: 'components/index.ts',
      formats: ['es'],
    },
    watch: {},
  },

  plugins: [
    external(),
    vue(),
    vueJsx(),
    eslint({
      include: ['components/**/*.ts', 'components/**/*.tsx', 'components/**/*.vue'],
      exclude: ['node_modules', 'components/icon/**/*'],
    }),
  ],
}) as InlineConfig;
