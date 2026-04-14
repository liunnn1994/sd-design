import { rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

import createModuleConfig from './configs/vite.module.mjs';
import createUmdConfig from './configs/vite.umd.mjs';

const shouldBuildUmd = process.argv.includes('--umd');

export default async function buildComponent({ umd = false } = {}) {
  await rm('es', { recursive: true, force: true });
  await rm('lib', { recursive: true, force: true });
  await build(createModuleConfig());

  if (!umd) {
    return;
  }

  await rm('dist', { recursive: true, force: true });
  for (const type of ['component', 'icon']) {
    await build(createUmdConfig(type, { minify: false }));
    await build(createUmdConfig(type, { minify: true }));
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildComponent({ umd: shouldBuildUmd });
}
