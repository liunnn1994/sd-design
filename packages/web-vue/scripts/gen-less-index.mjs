// oxlint-disable no-console
import { globSync } from 'glob';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import paths from './utils/paths.mjs';

export default async function generateLessIndex() {
  let lessContent = `@import './style/index.less';\n@import './trigger/style/index.less';\n`;
  const lessFiles = globSync('**/style/index.less', {
    cwd: paths.components,
    ignore: ['style/index.less', 'trigger/style/index.less'],
  });

  for (const lessFile of lessFiles) {
    lessContent += `@import './${lessFile}';\n`;
  }

  await writeFile(path.resolve(paths.components, 'index.less'), lessContent, 'utf8');
  console.log('Generated components/index.less');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateLessIndex();
}
