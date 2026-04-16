import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const iconDir = path.resolve(packageRoot, 'es', 'icon');

await mkdir(iconDir, { recursive: true });

await writeFile(
  path.resolve(iconDir, 'index.js'),
  "export { default } from '../icon.js';\nexport * from '../icon.js';\n",
  'utf8',
);
