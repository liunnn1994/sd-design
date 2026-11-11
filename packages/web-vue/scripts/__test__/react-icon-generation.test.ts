import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

import type { IconNode } from '../../../web-core/src/icon/types.ts';

const vueRoot = path.resolve(import.meta.dirname, '../..');
const coreIcons = path.resolve(vueRoot, '../web-core/src/icon/icons');
const reactIcons = path.resolve(vueRoot, '../web-react/src/icon');
const escape = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
function svg(node: IconNode | string): string {
  if (typeof node === 'string') return escape(node);
  const attrs = Object.entries(node.attributes)
    .map(([name, value]) => ` ${name}="${escape(value)}"`)
    .join('');
  return node.children.length
    ? `<${node.tag}${attrs}>${node.children.map(svg).join('')}</${node.tag}>`
    : `<${node.tag}${attrs}/>`;
}

test('every Vue icon has identical Core geometry and matching React named and default exports', async () => {
  const vueIndex = await readFile(path.join(vueRoot, 'components/icon/index.ts'), 'utf8');
  const reactIndex = await readFile(path.join(reactIcons, 'index.ts'), 'utf8');
  const entries = [...vueIndex.matchAll(/export \{ default as (\w+) \} from '\.\/(icon-[\w-]+)'/g)];
  assert.ok(entries.length > 250);
  assert.equal(
    (await readdir(coreIcons)).filter((name) => /^icon-.*\.ts$/.test(name)).length,
    entries.length,
  );
  assert.equal(
    (await readdir(reactIcons)).filter((name) => /^icon-.*\.ts$/.test(name)).length,
    entries.length,
  );
  for (const [, component, name] of entries) {
    const definition: IconNode = (
      await import(pathToFileURL(path.join(coreIcons, `${name}.ts`)).href)
    ).default;
    const vueSource = await readFile(
      path.join(vueRoot, `components/icon/${name}/${name}.vue`),
      'utf8',
    );
    const template = vueSource
      .match(/<svg[^]*?<\/svg>/)![0]
      .replace(/ (?::class|:style|v-bind|@click)="[^"]*"/g, '');
    assert.equal(svg(definition), template, `${name} geometry`);
    assert.ok(
      reactIndex.replace(/\s+/g, '').includes(`export{defaultas${component}}from'./${name}.js';`),
      `${name} public export`,
    );
    const wrapper = await readFile(path.join(reactIcons, `${name}.ts`), 'utf8');
    assert.ok(
      wrapper
        .replace(/\s+/g, '')
        .replaceAll(',)', ')')
        .includes(`createIcon('${name.slice(5)}','${component}',definition)`),
    );
    assert.ok(wrapper.includes(`export default ${component};`));
  }
});
