import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { terser } from 'rollup-plugin-terser';
import { InlineConfig } from 'vite';
import svgLoader from 'vite-svg-loader';

const getConfig = ({ input, name }: { input: string; name: string }): InlineConfig => {
  return {
    mode: 'production',
    build: {
      target: 'es2015',
      outDir: 'dist',
      emptyOutDir: true,
      minify: false,
      rollupOptions: {
        external: ['vue', '@sdata/web-vue', '@sdata/web-vue/es/icon'],
        output: [
          {
            format: 'es',
            entryFileNames: 'index.esm.js',
          },
          {
            format: 'cjs',
            entryFileNames: 'index.cjs.js',
          },
          {
            format: 'umd',
            entryFileNames: 'index.min.js',
            sourcemap: true,
            name,
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
      lib: {
        entry: input,
        formats: ['es'],
      },
    },
    plugins: [vue(), vueJsx(), svgLoader()],
  };
};

export default getConfig;
