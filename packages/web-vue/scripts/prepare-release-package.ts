import type { PackageJson } from 'type-fest';

import { readFile, writeFile } from 'node:fs/promises';

const nextVersion = process.argv[2];

if (!nextVersion) {
  throw new Error('Missing release version argument.');
}

const vueUrl = new URL('../package.json', import.meta.url);
const coreUrl = new URL('../../web-core/package.json', import.meta.url);
const [vueSource, coreSource] = await Promise.all([
  readFile(vueUrl, 'utf8'),
  readFile(coreUrl, 'utf8'),
]);
const vue: PackageJson = JSON.parse(vueSource);
const core: PackageJson = JSON.parse(coreSource);

if (
  vue.name !== '@sdata/web-vue' ||
  core.name !== '@sdata/web-core' ||
  vue.dependencies?.['@sdata/web-core'] !== 'workspace:^'
) {
  throw new Error('Core and Vue releases require the @sdata/web-core workspace:^ dependency.');
}

core.version = nextVersion;
vue.version = nextVersion;
await writeFile(coreUrl, `${JSON.stringify(core, null, 2)}\n`);
await writeFile(vueUrl, `${JSON.stringify(vue, null, 2)}\n`);

process.stdout.write(`Prepared ${core.name} and ${vue.name}@${nextVersion}\n`);
