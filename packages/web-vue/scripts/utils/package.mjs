import { readFile } from 'node:fs/promises';
import path from 'node:path';

let packageCache;

export const getPackage = async () => {
  if (!packageCache) {
    const content = await readFile(path.resolve(process.cwd(), 'package.json'), 'utf8');
    packageCache = JSON.parse(content);
  }

  return packageCache;
};
