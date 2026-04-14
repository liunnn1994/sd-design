import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { globSync } from 'glob';

import externalPlugin from '../plugins/vite-plugin-external.mjs';
import vueExportHelperPlugin from '../plugins/vite-plugin-vue-export-helper.mjs';

export default function createModuleConfig() {
  const langFiles = globSync('components/locale/lang/*.ts');

  return {
    mode: 'production',
    build: {
      target: 'es2015',
      outDir: 'es',
      emptyOutDir: false,
      minify: false,
      reportCompressedSize: false,
      rollupOptions: {
        input: ['components/index.ts', 'components/icon/index.ts', ...langFiles],
        output: [
          {
            format: 'es',
            dir: 'es',
            entryFileNames: '[name].js',
            preserveModules: true,
            preserveModulesRoot: 'components',
          },
          {
            format: 'cjs',
            dir: 'lib',
            entryFileNames: '[name].js',
            preserveModules: true,
            preserveModulesRoot: 'components',
          },
        ],
      },
      lib: {
        entry: 'components/index.ts',
        formats: ['es', 'cjs'],
      },
    },
    plugins: [externalPlugin(), vue(), vueJsx(), vueExportHelperPlugin()],
  };
}
