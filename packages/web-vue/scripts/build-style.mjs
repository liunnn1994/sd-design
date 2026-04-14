import CleanCSS from 'clean-css';
import { globSync } from 'glob';
import less from 'less';
import { mkdir, readFile, rm, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

import createStyleConfig from './configs/vite.style.mjs';
import generateLessIndex from './gen-less-index.mjs';
import paths from './utils/paths.mjs';

async function copyInto(targetPath, sourcePath) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await cp(sourcePath, targetPath, { recursive: true, force: true });
}

export default async function buildStyle({ material = false } = {}) {
  if (!material) {
    await generateLessIndex();
  }

  const files = globSync('**/*.{less,js}', {
    cwd: paths.components,
  });

  for (const filename of files) {
    const absolute = path.resolve(paths.components, filename);
    await copyInto(paths.resolvePath('es', filename), absolute);
    await copyInto(paths.resolvePath('lib', filename), absolute);

    if (filename.endsWith('index.less')) {
      const lessContent = await readFile(absolute, 'utf8');
      const result = await less.render(lessContent, {
        filename,
        paths: [path.resolve(paths.components, path.dirname(filename)), paths.root],
      });
      const cssFilename = filename.replace('.less', '.css');
      await writeFile(paths.resolvePath('es', cssFilename), result.css, 'utf8');
      await writeFile(paths.resolvePath('lib', cssFilename), result.css, 'utf8');
    }
  }

  const indexLessPath = paths.resolvePath('components', 'index.less');
  await copyInto(paths.resolvePath('es', 'index.less'), indexLessPath);
  await copyInto(paths.resolvePath('lib', 'index.less'), indexLessPath);

  const indexLess = await readFile(indexLessPath, 'utf8');
  const result = await less.render(indexLess, {
    filename: indexLessPath,
    paths: [paths.components],
  });

  await rm(paths.resolvePath('dist'), { recursive: true, force: true });
  await mkdir(paths.resolvePath('dist'), { recursive: true });

  await writeFile(
    paths.resolvePath('dist', material ? 'index.less' : 'sd.less'),
    "@import '../es/index.less';\n\n",
    'utf8',
  );
  await writeFile(paths.resolvePath('dist', material ? 'index.css' : 'sd.css'), result.css, 'utf8');

  const compress = new CleanCSS().minify(result.css);
  await writeFile(
    paths.resolvePath('dist', material ? 'index.min.css' : 'sd.min.css'),
    compress.styles,
    'utf8',
  );

  const indexFiles = globSync('components/**/style/index.ts', {
    cwd: paths.root,
  });
  const rollupInput = indexFiles.reduce((accumulator, current) => {
    accumulator[current.slice(11, -3)] = current;
    return accumulator;
  }, {});

  await build(createStyleConfig(rollupInput));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildStyle();
}
