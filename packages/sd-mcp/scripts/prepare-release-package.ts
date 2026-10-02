import type { PackageJson } from 'type-fest';

import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const nextVersion = process.argv[2];

if (!nextVersion) {
  throw new Error('Missing release version argument.');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.resolve(packageRoot, 'package.json');
const packageJson: PackageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

execFileSync(process.execPath, ['./scripts/build.ts', nextVersion], {
  cwd: packageRoot,
  stdio: 'inherit',
});

packageJson.version = nextVersion;
await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

process.stdout.write(`Prepared @sdata/web-vue-mcp@${nextVersion}\n`);
