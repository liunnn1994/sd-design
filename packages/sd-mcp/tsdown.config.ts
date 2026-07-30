import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: true,
  target: 'es2022',
  clean: true,
  define: {
    'process.env.SD_MCP_VERSION': JSON.stringify(process.env.SD_MCP_VERSION ?? 'development'),
  },
  outExtensions: () => ({ js: '.js' }),
  outputOptions: {
    banner: '#!/usr/bin/env node',
  },
});
