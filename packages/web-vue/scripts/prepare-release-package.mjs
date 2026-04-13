import { readFile, writeFile } from 'node:fs/promises';

const nextVersion = process.argv[2];

if (!nextVersion) {
  throw new Error('Missing release version argument.');
}

const packageJsonUrl = new URL('../package.json', import.meta.url);
const packageJson = JSON.parse(await readFile(packageJsonUrl, 'utf8'));

packageJson.version = nextVersion;

await writeFile(packageJsonUrl, `${JSON.stringify(packageJson, null, 2)}\n`);

process.stdout.write(`Prepared ${packageJson.name}@${nextVersion}\n`);
