import cssjsPlugin from '../plugins/vite-plugin-cssjs.mjs';

export default function createStyleConfig(rollupInput) {
  return {
    mode: 'production',
    build: {
      target: 'es2015',
      outDir: 'es',
      emptyOutDir: false,
      minify: false,
      reportCompressedSize: false,
      rollupOptions: {
        external: /less$/,
        input: rollupInput,
        output: [
          {
            format: 'es',
            dir: 'es',
            entryFileNames: '[name].js',
          },
          {
            format: 'cjs',
            dir: 'lib',
            entryFileNames: '[name].js',
          },
        ],
      },
      lib: {
        entry: '',
        formats: ['es', 'cjs'],
      },
    },
    plugins: [cssjsPlugin()],
  };
}
