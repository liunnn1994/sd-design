import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { optimizeDeps, resolveConfig } from 'vite';

import config from '../cypress.config.ts';

test('Cypress scans Vue theme previews and their React TSX dependencies with a cold cache', async (t) => {
  const devServer = config.component?.devServer;
  assert.ok(devServer && typeof devServer === 'object');
  assert.ok('viteConfig' in devServer);
  const viteConfig = devServer.viteConfig;
  assert.ok(viteConfig && typeof viteConfig === 'object');
  const cacheDir = await mkdtemp(path.join(tmpdir(), 'sd-cypress-scan-'));
  t.after(() => rm(cacheDir, { recursive: true, force: true }));
  const resolved = await resolveConfig(
    {
      ...viteConfig,
      configFile: false,
      root: fileURLToPath(new URL('..', import.meta.url)),
      cacheDir,
      logLevel: 'silent',
      optimizeDeps: {
        ...viteConfig.optimizeDeps,
        entries: ['cypress/support/component.ts', 'components/**/__test__/*.cy.ts'],
      },
    },
    'serve',
  );
  const metadata = await optimizeDeps(resolved, true);
  assert.ok(metadata.optimized.react);
  assert.ok(metadata.optimized.vue);
});
