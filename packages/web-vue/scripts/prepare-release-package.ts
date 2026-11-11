import type { PackageJson } from 'type-fest';

import { readFile, writeFile } from 'node:fs/promises';

const [name, nextVersion] = process.argv.slice(2);
if (!['web-core', 'web-vue', 'web-react'].includes(name) || !nextVersion) {
  throw new Error('Expected a release package (web-core, web-vue, web-react) and version.');
}

const url = new URL(`../../${name}/package.json`, import.meta.url);
const manifest: PackageJson = JSON.parse(await readFile(url, 'utf8'));
if (
  manifest.name !== `@sdata/${name}` ||
  (name !== 'web-core' &&
    !['workspace:^', 'workspace:*'].includes(manifest.dependencies?.['@sdata/web-core'] ?? ''))
) {
  throw new Error('Unexpected package name or missing Core workspace dependency.');
}

manifest.version = nextVersion;
await writeFile(url, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`Prepared ${manifest.name}@${nextVersion}\n`);
