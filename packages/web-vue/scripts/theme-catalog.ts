import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateThemeCatalog } from '../../web-core/scripts/theme-catalog.ts';
export { declarations, generateThemeCatalog } from '../../web-core/scripts/theme-catalog.ts';

// Preserve the existing Vue metadata path for docs and consumers of sources.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateThemeCatalog();
  await copyFile(
    new URL('../../web-core/styles/config-provider/theme-catalog.json', import.meta.url),
    new URL('../components/config-provider/theme-catalog.json', import.meta.url),
  );
}
