import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { terser } from 'rollup-plugin-terser';
import { InlineConfig } from 'vite';

export default (type: 'component' | 'icon'): InlineConfig => {
  const entry = type === 'component' ? 'components/sd-vue.ts' : 'components/icon/sd-vue-icon.ts';
  const entryFileName = type === 'component' ? 'sd-vue' : 'sd-vue-icon';
  const name = type === 'component' ? 'SDVue' : 'SDVueIcon';

  return {
    mode: 'production',
    build: {
      target: 'es2015',
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: true,
      minify: false,
      reportCompressedSize: false,
      rollupOptions: {
        external: 'vue',
        output: [
          {
            format: 'umd',
            name,
            entryFileNames: `${entryFileName}.js`,
            globals: {
              vue: 'Vue',
            },
          },
          {
            format: 'umd',
            name,
            entryFileNames: `${entryFileName}.min.js`,
            globals: {
              vue: 'Vue',
            },
            // @ts-ignore
            plugins: [terser()],
          },
        ],
      },
      // 开启lib模式
      lib: {
        entry,
        formats: ['umd'],
        name,
      },
    },
    // @ts-ignore vite内部类型错误
    plugins: [vue(), vueJsx()],
  };
};
