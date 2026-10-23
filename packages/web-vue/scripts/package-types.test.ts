import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const packageRoot = path.resolve(import.meta.dirname, '..');

test('built declarations pass strict consumer checking and preserve generic clamp slots', async () => {
  const directory = await mkdtemp(path.join(packageRoot, 'node_modules', '.package-types-'));
  const source = `
<script setup lang="ts">
import { WrapClamp } from '../../es/index.js';
import type { VirtualListRef } from '../../es/_components/virtual-list/interface.js';
import '../../es/button/style/index.js';
declare const virtualList: VirtualListRef;
virtualList.restoreCache(virtualList.cacheSnapshot());
</script>
<template>
  <WrapClamp :items="[{ id: 1, label: 'One' }]" item-key="id">
    <template #item="{ item }">{{ item.label.toUpperCase() }}</template>
  </WrapClamp>
  <SdWrapClamp :items="[{ id: 1, label: 'One' }]" item-key="id">
    <template #item="{ item }">{{ item.label.toUpperCase() }}</template>
  </SdWrapClamp>
</template>`;
  const compile = () =>
    spawnSync(
      process.execPath,
      [path.join(packageRoot, 'node_modules/vue-tsc/bin/vue-tsc.js'), '-p', directory],
      { cwd: packageRoot, encoding: 'utf8' },
    );
  try {
    await writeFile(
      path.join(directory, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          skipLibCheck: false,
          noEmit: true,
          lib: ['ESNext', 'DOM', 'DOM.Iterable'],
          types: ['vite/client'],
        },
        vueCompilerOptions: { strictTemplates: true },
        include: ['consumer.vue'],
      }),
    );
    await writeFile(path.join(directory, 'consumer.vue'), source);
    const valid = compile();
    assert.equal(valid.status, 0, valid.stdout + valid.stderr);

    await writeFile(
      path.join(directory, 'consumer.vue'),
      source.replaceAll('item.label', 'item.missing'),
    );
    const invalid = compile();
    assert.notEqual(invalid.status, 0, 'generic slots must not become any');
    assert.equal(
      [...(invalid.stdout + invalid.stderr).matchAll(/Property 'missing' does not exist/g)].length,
      2,
      invalid.stdout + invalid.stderr,
    );
  } finally {
    assert.ok(directory.startsWith(path.join(packageRoot, 'node_modules', '.package-types-')));
    await rm(directory, { recursive: true, force: true });
  }
});
