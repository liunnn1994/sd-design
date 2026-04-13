import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { terser } from 'rollup-plugin-terser';
import { InlineConfig } from 'vite';
import svgLoader from 'vite-svg-loader';

export default ({ name }: { name: string }): InlineConfig => {
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
        external: ['vue', '@sdata/web-vue', '@sdata/web-vue/es/icon'],
        output: [
          {
            format: 'umd',
            name,
            entryFileNames: `index.js`,
            sourcemap: true,
            globals: {
              vue: 'Vue',
              '@sdata/web-vue': 'SDVue',
              '@sdata/web-vue/es/icon': 'SDVueIcon',
            },
          },
          {
            format: 'umd',
            name,
            entryFileNames: `index.min.js`,
            sourcemap: true,
            globals: {
              vue: 'Vue',
              '@sdata/web-vue': 'SDVue',
              '@sdata/web-vue/es/icon': 'SDVueIcon',
            },
            // @ts-ignore
            plugins: [terser()],
          },
        ],
      },
      // 开启lib模式
      lib: {
        entry: 'components/components.ts',
        formats: ['umd'],
        name,
      },
    },
    // @ts-ignore vite内部类型错误
    plugins: [vue(), vueJsx(), svgLoader()],
  };
};
