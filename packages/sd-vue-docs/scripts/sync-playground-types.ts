import assert from 'node:assert/strict';
import { existsSync, globSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { build } from 'tsdown';

const root = resolve(import.meta.dirname, '..');
for (const framework of ['vue', 'react']) {
  const packageRoot = resolve(root, `../web-${framework}`);
  const vendor = resolve(root, `public/vendor/sd-web-${framework}`);
  const entry: Record<string, string> = {};
  const imports: Record<string, string> = {};
  function add(specifier: string, file: string) {
    if (!existsSync(file) && existsSync(file.replace(/\.d\.ts$/, '.vue.d.ts')))
      file = file.replace(/\.d\.ts$/, '.vue.d.ts');
    assert.ok(existsSync(file), `Missing playground declarations: ${file}`);
    const name = specifier.startsWith('@sdata/web-core/')
      ? `core/${specifier.slice('@sdata/web-core/'.length)}`
      : specifier === `@sdata/web-${framework}`
        ? 'index'
        : specifier.slice(`@sdata/web-${framework}/`.length).replace(/\.js$/, '');
    entry[name] = file;
    imports[specifier] = `types/${name}.d.ts`;
  }
  if (framework === 'vue') {
    const manifest = JSON.parse(
      await readFile(resolve(vendor, 'deps/component-manifest.json'), 'utf8'),
    ) as { exports: Record<string, { specifier: string }> };
    add('@sdata/web-vue', resolve(packageRoot, 'es/index.d.ts'));
    add(
      '@sdata/web-core/icon/icons/catalog',
      resolve(root, '../web-core/dist/icon/icons/catalog.d.ts'),
    );
    for (const { specifier } of Object.values(manifest.exports)) {
      add(
        specifier,
        resolve(packageRoot, specifier.slice('@sdata/web-vue/'.length).replace(/\.js$/, '.d.ts')),
      );
    }
    for (const path of ['es/icon.js', 'es/icon/index.js'])
      add(`@sdata/web-vue/${path}`, resolve(packageRoot, 'es/icon/index.d.ts'));
  } else {
    const pkg = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8')) as {
      exports: Record<string, { types?: string }>;
    };
    for (const [path, target] of Object.entries(pkg.exports)) {
      if (!target.types) continue;
      if (path.includes('*')) {
        for (const file of globSync(target.types, { cwd: packageRoot })) {
          const [before, after] = target.types.split('*') as [string, string];
          const relative = `./${file.replaceAll('\\', '/')}`;
          const wildcard = relative.slice(before.length, relative.length - after.length);
          add(
            `@sdata/web-react/${path.slice(2).replace('*', wildcard)}`,
            resolve(packageRoot, file),
          );
        }
      } else
        add(
          path === '.' ? '@sdata/web-react' : `@sdata/web-react/${path.slice(2)}`,
          resolve(packageRoot, target.types),
        );
    }
  }
  const outDir = resolve(vendor, 'types');
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  const entries = Object.entries(entry);
  for (let start = 0; start < entries.length; start += 4)
    await Promise.all(
      entries.slice(start, start + 4).map(([name, file]) =>
        build({
          config: false,
          entry: { [name]: file },
          outDir,
          format: 'esm',
          fixedExtension: false,
          outputOptions: { codeSplitting: false },
          dts: { dtsOnly: true, tsconfig: false },
          deps: {
            neverBundle: (id) =>
              !id.startsWith('.') && !isAbsolute(id) && !id.startsWith('@sdata/web-core'),
            dts: { alwaysBundle: [/^@sdata\/web-core/] },
          },
          clean: false,
          logLevel: 'warn',
        }),
      ),
    );
  for (const file of globSync('**/*.d.ts', { cwd: outDir })) {
    const path = resolve(outDir, file);
    const code = await readFile(path, 'utf8');
    // Global Vue registrations belong to the docs app; standalone examples import their components.
    await writeFile(
      path,
      code.replace(/^\/\/\/ <reference path="\.\/components\.d\.ts" \/>\r?\n/gm, ''),
    );
  }
  for (const path of Object.values(imports))
    assert.ok(existsSync(resolve(vendor, path)), `Missing bundled declarations: ${path}`);
  await writeFile(resolve(vendor, 'types-map.json'), JSON.stringify({ imports }));
  console.log(`${framework}: ${Object.keys(imports).length} local playground type entries`);
}
