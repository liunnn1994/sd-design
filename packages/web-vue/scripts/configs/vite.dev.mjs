import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import externalPlugin from '../plugins/vite-plugin-external.mjs';

export default function createDevConfig() {
  return {
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
    plugins: [externalPlugin(), vue(), vueJsx()],
  };
}
