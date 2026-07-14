import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: true,
  target: 'es2022',
  clean: true,
  outExtensions: () => ({ js: '.js' }),
  outputOptions: {
    banner: '#!/usr/bin/env node',
  },
});
