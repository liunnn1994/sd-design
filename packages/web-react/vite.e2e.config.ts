import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  cacheDir: resolve(import.meta.dirname, 'node_modules/.vite-e2e'),
  server: { hmr: false, watch: null },
});
