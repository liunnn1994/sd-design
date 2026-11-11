import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';

import {
  collectDemoIds,
  generateFrameworkDocs,
} from '../packages/sd-vue-docs/scripts/framework-docs.ts';

const root = resolve(import.meta.dirname, '..');
function exportsOf(file: string) {
  const source = ts.createSourceFile(
    file,
    readFileSync(resolve(root, file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const exports = new Map<string, string[]>();
  for (const statement of source.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      statement.isTypeOnly ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    )
      continue;
    if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue;
    const names = statement.exportClause.elements
      .filter((item) => !item.isTypeOnly)
      .map((item) => item.name.text);
    const module = statement.moduleSpecifier.text;
    exports.set(module, [...(exports.get(module) ?? []), ...names]);
  }
  return exports;
}
generateFrameworkDocs({ check: true });
const docsManifest = JSON.parse(
  readFileSync(resolve(root, 'packages/sd-vue-docs/src/generated/docs-manifest.json'), 'utf8'),
) as Array<{ source: string; slug: string; demos: string[] }>;
for (const page of docsManifest) {
  const source = readFileSync(
    resolve(root, 'packages/sd-vue-docs/src/content/shared', page.source),
    'utf8',
  );
  assert.deepEqual(collectDemoIds(source), page.demos);
  for (const id of page.demos)
    assert.ok(
      existsSync(resolve(root, 'packages/sd-vue-docs/src/components/react/generated', `${id}.tsx`)),
      `Missing React scenario ${id}`,
    );
}
const vue = exportsOf('packages/web-vue/components/index.ts');
const react = new Set([...exportsOf('packages/web-react/src/index.ts').values()].flat());
const manifest = JSON.parse(readFileSync(resolve(root, 'packages/web-react/package.json'), 'utf8'));
const components = [...vue]
  .filter(
    ([module]) =>
      existsSync(resolve(root, 'packages/web-vue/components', module, 'index.ts')) &&
      !module.startsWith('./_') &&
      module !== './locale',
  )
  .map(([module, names]) => {
    const name = module.slice(2);
    return {
      name,
      vueExports: names,
      missingReactExports: names.filter((value) => !react.has(value)),
      reactSource: existsSync(resolve(root, 'packages/web-react/src', name)),
      reactSubpath: Boolean(manifest.exports[`./${name}`]),
      reactStyle: existsSync(resolve(root, 'packages/web-react/styles', `${name}.scss`)),
      reactDocs: docsManifest.some((page) => page.slug === `components/${name}`),
      scenarios: docsManifest.find((page) => page.slug === `components/${name}`)?.demos ?? [],
      behaviorVerified: false,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));
assert.ok(components.length >= 80, 'Inventory must cover the complete Vue public component entry');
assert.equal(new Set(components.map((item) => item.name)).size, components.length);
const inventory = {
  baseline: 'packages/web-vue/components/index.ts',
  note: 'Shared pages, scenario sources and generated output are checked. Every component still requires props/events/render props/ref/style/controlled behavior review and runtime acceptance.',
  components,
};
if (process.argv.includes('--write'))
  writeFileSync(
    resolve(root, 'docs/react-component-inventory.json'),
    `${JSON.stringify(inventory, null, 2)}\n`,
  );
const gaps = components.filter(
  (item) =>
    item.missingReactExports.length ||
    !item.reactSource ||
    !item.reactSubpath ||
    !item.reactStyle ||
    !item.reactDocs,
);
console.log(
  `${components.length} Vue public component groups; ${gaps.length} have entry/source/style/docs gaps.`,
);
for (const item of gaps)
  console.log(
    `${item.name}: ${[
      item.missingReactExports.length && `exports ${item.missingReactExports.join(', ')}`,
      !item.reactSource && 'source',
      !item.reactSubpath && 'subpath',
      !item.reactStyle && 'style',
      !item.reactDocs && 'docs',
    ]
      .filter(Boolean)
      .join('; ')}`,
  );
process.exitCode = gaps.length ? 1 : 0;
