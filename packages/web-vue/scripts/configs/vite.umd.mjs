import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default function createUmdConfig(type, { minify }) {
  const entry = type === 'component' ? 'components/sd-vue.ts' : 'components/icon/sd-vue-icon.ts';
  const entryFileName = type === 'component' ? 'sd-vue' : 'sd-vue-icon';
  const name = type === 'component' ? 'SDVue' : 'SDVueIcon';

  return {
    mode: 'production',
    build: {
      target: 'es2015',
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: !minify,
      minify: minify ? 'esbuild' : false,
      reportCompressedSize: false,
      rollupOptions: {
        external: ['vue'],
        output: {
          format: 'umd',
          name,
          entryFileNames: `${entryFileName}${minify ? '.min' : ''}.js`,
          globals: {
            vue: 'Vue',
          },
        },
      },
      lib: {
        entry,
        formats: ['umd'],
        name,
      },
    },
    plugins: [vue(), vueJsx()],
  };
}
