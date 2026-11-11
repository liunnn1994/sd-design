import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { test } from 'node:test';

import {
  collectDemoIds,
  docsRoot,
  generateFrameworkDocs,
  parseDocument,
  renderDocument,
} from './framework-docs.ts';

const source = `---
title: 按钮 Button
description: 共享按钮说明
---

### 基本用法

相同的说明。[相关组件](/components/link/#api)

<Demo id="button/basic" />

### 禁用状态

<Demo id="button/disabled" />

<Framework only="vue">

Vue 模板语法

</Framework>

<Framework only="react">

React JSX 语法

</Framework>
`;

test('both frameworks render the same ordered scenarios and shared prose', () => {
  assert.deepEqual(collectDemoIds(source), ['button/basic', 'button/disabled']);
  const vue = renderDocument(source, 'vue', 'components/button');
  const react = renderDocument(source, 'react', 'components/button');
  for (const page of [vue, react]) {
    assert.match(page, /title: 按钮 Button/);
    assert.match(page, /相同的说明/);
    assert.ok(page.indexOf('### 基本用法') < page.indexOf('### 禁用状态'));
    assert.equal((page.match(/<DemoBlock /g) ?? []).length, 2);
    assert.doesNotMatch(page, /<Framework|<Demo /);
  }
  assert.match(vue, /generated\/button\/basic.vue\?raw/);
  assert.match(vue, /client:only="vue"/);
  assert.match(react, /react\/generated\/button\/basic.tsx\?raw/);
  assert.match(react, /client:only="react"/);
  assert.match(react, /\/react\/components\/link\/#api/);
  assert.match(react, /React JSX 语法/);
  assert.doesNotMatch(react, /Vue 模板语法/);
  assert.doesNotMatch(vue, /React JSX 语法/);
});

test('React links include JSX navigation and text resource paths without an added slash', () => {
  const source =
    '---\ntitle: LLMs\n---\n\n[索引](/llms/llms.txt)\n\n[/llms/llms.txt](/llms/llms.txt)\n\n<LinkButton href="/llms/components/button.md">按钮</LinkButton>';
  const output = renderDocument(source, 'react', 'llms_txt');
  assert.match(output, /\[索引\]\(\/react\/llms\/llms.txt\)/);
  assert.match(output, /href="\/react\/llms\/components\/button.md"/);
  assert.match(output, /\[\/llms\/llms.txt\]\(\/react\/llms\/llms.txt\)/);
});

test('missing React example fails rather than falling back to a generic demo', (t) => {
  const root = mkdtempSync(resolve(tmpdir(), 'sd-framework-docs-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(resolve(root, 'src/content/shared/components/button'), { recursive: true });
  writeFileSync(resolve(root, 'src/content/shared/components/button/index.mdx'), source);
  assert.throws(() => generateFrameworkDocs({ root }), /react: button\/disabled/);
});

test('generation is deterministic and check detects changes without writing', (t) => {
  const root = mkdtempSync(resolve(tmpdir(), 'sd-framework-docs-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(resolve(root, 'src/content/shared'), { recursive: true });
  writeFileSync(resolve(root, 'src/content/shared/index.mdx'), source);
  generateFrameworkDocs({ root, validate: false });
  assert.equal(generateFrameworkDocs({ root, validate: false }).changed.length, 0);
  const output = resolve(root, 'src/content/docs/react/index.mdx');
  writeFileSync(output, 'changed');
  assert.throws(() => generateFrameworkDocs({ root, check: true, validate: false }), /stale/);
  assert.equal(readFileSync(output, 'utf8'), 'changed');
});

test('all component pages preserve heading, scenario and table coverage across frameworks', () => {
  const { manifest } = generateFrameworkDocs({ check: true });
  const components = manifest.filter((page) => page.slug.startsWith('components/'));
  assert.ok(components.length > 90, 'scan the entire component catalog');
  for (const page of components) {
    const vue = readFileSync(resolve(docsRoot, 'src/content/docs', page.source), 'utf8');
    const react = readFileSync(resolve(docsRoot, 'src/content/docs/react', page.source), 'utf8');
    const coverage = (source: string) => {
      const headings: (number | undefined)[] = [];
      const tables: number[][] = [];
      let inApi = false;
      function visit(node: ReturnType<typeof parseDocument>) {
        if (node.type === 'heading') headings.push(node.depth);
        if (node.type === 'heading' && node.depth === 2) {
          inApi = node.children?.some((child) => /\bAPI\b/.test(child.value ?? '')) ?? false;
        }
        if (node.type === 'table' && inApi)
          tables.push(node.children!.map((row) => row.children!.length));
        node.children?.forEach(visit);
      }
      visit(parseDocument(source));
      return {
        headings,
        tables,
        demos: [...source.matchAll(/<DemoBlock id="([^"]+)"/g)].map((match) => match[1]),
      };
    };
    assert.deepEqual(coverage(react), coverage(vue), page.slug);
    const visit = (node: ReturnType<typeof parseDocument>) => {
      if (node.type === 'code' || node.type === 'inlineCode') {
        assert.doesNotMatch(
          node.value ?? '',
          /\bv-model\b|<template\b|<script setup|createApp\(|getCurrentInstance\(|\._context\b|@sdata\/web-vue(?:['"/]|$)/,
          page.slug,
        );
      }
      node.children?.forEach(visit);
    };
    visit(parseDocument(react));
  }
});
