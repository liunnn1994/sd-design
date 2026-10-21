import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

import { dayjs, methods } from '../dist/_utils/date.js';
import { getValueByPath, setValueByPath } from '../dist/_utils/get-value-by-path.js';
import {
  splitGraphemes,
  codeUnitToGraphemeIndex,
  graphemeIndexToCodeUnit,
} from '../dist/_utils/grapheme.js';
import * as core from '../dist/index.js';
import { addDecimal } from '../dist/input-number/decimal.js';

function moduleSpecifiers(source: string) {
  const specifiers: string[] = [];
  const syntax = ts.createSourceFile('boundary.ts', source, ts.ScriptTarget.Latest, true);
  const add = (node: ts.Node | undefined) => {
    if (node && ts.isStringLiteralLike(node)) specifiers.push(node.text);
  };
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) add(node.moduleSpecifier);
    else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
      add(node.arguments[0]);
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
      add(node.argument.literal);
    ts.forEachChild(node, visit);
  };
  visit(syntax);
  return specifiers;
}

test('core boundary inspection reads syntax instead of from/to object fields', () => {
  assert.deepEqual(
    moduleSpecifiers(`
    const hasCoords = 'from' in value || 'to' in value;
    import type { A } from 'vue';
    export { B } from './local.js';
    const c = import('react');
    type D = import('svelte').D;
    import 'solid';
  `),
    ['vue', './local.js', 'react', 'svelte', 'solid'],
  );
});

// Traverse every module, including ones outside the root barrel. A future
// renderer must never inherit Vue, a Vue-only dependency, or a sibling package.
test('all core imports stay within the framework-independent package boundary', async () => {
  const root = new URL('../src/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const dependencies = Object.keys(manifest.dependencies);
  const files = await readdir(root, { recursive: true });
  for (const file of files.filter((name) => name.endsWith('.ts'))) {
    const source = await readFile(new URL(file.replaceAll('\\', '/'), root), 'utf8');
    for (const specifier of moduleSpecifiers(source)) {
      assert.ok(!/vue|react|svelte|solid|web-vue/.test(specifier), `${file}: ${specifier}`);
      if (specifier.startsWith('.')) {
        const resolved = new URL(specifier, new URL(file.replaceAll('\\', '/'), root));
        assert.ok(resolved.href.startsWith(root.href), `${file} escapes core`);
      } else {
        assert.ok(
          dependencies.some((dep) => specifier === dep || specifier.startsWith(`${dep}/`)),
          `${file}: undeclared ${specifier}`,
        );
      }
    }
  }
});

test('the built ESM entry loads without a DOM or framework runtime', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  assert.equal(typeof core.theme.normalizeTheme, 'function');
  assert.equal(addDecimal('9007199254740993.10', 0.01, false), '9007199254740993.11');
  assert.equal(addDecimal('0.10', 0.2, true), '-0.10');
  assert.equal(dayjs('2026-01-03').isBetween(dayjs('2026-01-01'), dayjs('2026-01-04')), true);
  assert.equal(typeof dayjs().week(), 'number');
  assert.equal(methods.isSameWeek(dayjs('2025-12-31'), dayjs('2026-01-01'), 1), true);
});

test('nested field access retains prototype-pollution guards', () => {
  const data = { nested: { value: 1 } };
  setValueByPath(data, 'nested.value', 2);
  assert.equal(getValueByPath(data, 'nested.value'), 2);
  setValueByPath(data, '__proto__.polluted', true, { addPath: true });
  assert.equal(getValueByPath(data, '__proto__'), undefined);
  assert.equal(Object.hasOwn(Object.prototype, 'polluted'), false);
});

test('mask and text adapters can round-trip grapheme selections', () => {
  const text = 'A👨‍👩‍👧‍👦é中';
  assert.equal(splitGraphemes(text).length, 4);
  for (let index = 0; index <= 4; index++) {
    assert.equal(codeUnitToGraphemeIndex(text, graphemeIndexToCodeUnit(text, index)), index);
  }
});
