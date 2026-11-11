import type { AstroIntegration } from 'astro';
import type { InlineConfig } from 'vite';

import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createLogger, createServer, mergeConfig, normalizePath } from 'vite';

import astroConfig from '../astro.config.ts';
import { scopedReactRefresh } from '../src/integrations/scoped-react-refresh.ts';

// Use the integrations' real Vite plugins without starting the whole docs site.
test('Vue compilation does not inherit React Fast Refresh', async (t) => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const cacheDir = await mkdtemp(join(tmpdir(), 'sd-docs-refresh-'));
  const vueUrl = '/src/__refresh__/Vue.vue';
  const reactUrl = '/src/__refresh__/react/Counter.tsx';
  const fixtures: Record<string, string> = {
    [normalizePath(resolve(root, `.${vueUrl}`))]: `
      <script setup lang="ts">
        import { useAttrs } from 'vue';
        const attrs = useAttrs();
      </script>
      <template><div v-bind="attrs">Vue</div></template>
    `,
    [normalizePath(resolve(root, `.${reactUrl}`))]: `
      /** @jsxImportSource react */
      import { useState } from 'react';
      export default function Counter() {
        const [count, setCount] = useState(0);
        return <button onClick={() => setCount(count + 1)}>{count}</button>;
      }
    `,
  };
  const errors: string[] = [];
  const logger = createLogger('silent');
  logger.error = (message) => errors.push(message);
  let config: InlineConfig = {
    root,
    cacheDir,
    configFile: false,
    customLogger: logger,
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { entries: ['src/components/react/home/ThemeDemo.tsx'] },
    plugins: [
      scopedReactRefresh(),
      {
        name: 'refresh-test-fixtures',
        resolveId(id) {
          if (id in fixtures) return id;
          const fixtureId = normalizePath(resolve(root, `.${id}`));
          if (fixtureId in fixtures) return fixtureId;
        },
        load(id) {
          return fixtures[id];
        },
      },
    ],
  };
  type SetupContext = Parameters<NonNullable<AstroIntegration['hooks']['astro:config:setup']>>[0];
  const context = {
    command: 'dev',
    addRenderer() {},
    injectScript() {},
    updateConfig(next: Parameters<SetupContext['updateConfig']>[0]) {
      config = mergeConfig(config, next.vite ?? {});
    },
  } as unknown as SetupContext;

  const integrations = astroConfig.integrations as AstroIntegration[];
  for (const integration of integrations.filter(({ name }) =>
    ['@astrojs/vue', '@astrojs/react'].includes(name),
  )) {
    await integration.hooks['astro:config:setup']?.(context);
  }

  const server = await createServer(config);
  t.after(async () => {
    await server.close();
    await rm(cacheDir, { recursive: true, force: true });
  });

  await t.test('dependency scan handles React TSX containing import.meta.glob', async () => {
    const optimizer = server.environments.client!.depsOptimizer;
    assert.ok(optimizer);
    await optimizer.init();
    await optimizer.scanProcessing;
    assert.deepEqual(errors, []);
    assert.ok(optimizer.metadata.discovered.react || optimizer.metadata.optimized.react);
  });

  for (const environment of ['ssr', 'client']) {
    await t.test(`Vue ${environment} has no React refresh calls`, async () => {
      const result = await server.environments[environment]!.transformRequest(vueUrl);
      assert.ok(result);
      assert.doesNotMatch(result.code, /\$Refresh(?:Sig|Reg)\$/);
      if (environment === 'client') assert.match(result.code, /__VUE_HMR_RUNTIME__/);
    });
  }

  for (const environment of ['ssr', 'client']) {
    await t.test(`React ${environment} keeps its intended refresh behavior`, async () => {
      const result = await server.environments[environment]!.transformRequest(reactUrl);
      assert.ok(result);
      assert.match(result.code, /react[_/]jsx-dev-runtime/);
      assert.doesNotMatch(result.code, /vue[_/]jsx/);
      if (environment === 'client') {
        assert.match(result.code, /\$RefreshSig\$/);
        assert.match(result.code, /@react-refresh/);
      } else {
        assert.doesNotMatch(result.code, /\$Refresh(?:Sig|Reg)\$/);
      }
    });
  }
});
