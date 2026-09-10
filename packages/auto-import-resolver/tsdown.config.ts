import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'es2022',
  deps: {
    neverBundle: true,
  },
  outExtensions: () => ({ js: '.js' }),
});
