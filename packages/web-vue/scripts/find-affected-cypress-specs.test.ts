import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { discoverMetadata, selectAffectedSpecs } from './find-affected-cypress-specs.ts';

const componentSpecs = new Map([
  ['button', ['components/button/__test__/index.cy.ts']],
  ['form', ['components/form/__test__/index.cy.ts']],
  ['input', ['components/input/__test__/index.cy.ts']],
]);
const componentDependencies = new Map([
  ['button', new Set<string>()],
  ['form', new Set(['input'])],
  ['input', new Set<string>()],
]);
const select = (changedFiles: string[], forceAll = false, additiveFiles = new Set<string>()) =>
  selectAffectedSpecs({
    changedFiles,
    componentDependencies,
    componentSpecs,
    forceAll,
    additiveFiles,
  });

test('selects tests for a changed component', () => {
  assert.deepEqual(select(['packages/web-vue/components/button/button.vue']), {
    mode: 'affected',
    components: ['button'],
    specs: ['components/button/__test__/index.cy.ts'],
  });
});

test('includes reverse dependents transitively', () => {
  assert.deepEqual(select(['packages/web-vue/components/input/input.vue']).components, [
    'form',
    'input',
  ]);
});

test('selects an edited spec and its test dependents without expanding runtime groups', () => {
  const changed = 'components/input/__test__/index.cy.ts';
  const sibling = 'components/input/__test__/keyboard.cy.ts';
  const consumer = 'components/form/__test__/index.cy.ts';
  const otherDependent = 'components/form/__test__/rules.cy.ts';
  const browserReverse = new Map([
    [`packages/web-vue/${changed}`, [`packages/web-vue/${consumer}`]],
  ]);
  const specs = new Map([
    ['input', [changed, sibling]],
    ['form', [consumer, otherDependent]],
  ]);
  const options = { componentDependencies, componentSpecs: specs, browserReverse };

  assert.deepEqual(
    selectAffectedSpecs({ ...options, changedFiles: [`packages/web-vue/${changed}`] }).specs,
    [consumer, changed],
  );
  assert.deepEqual(
    selectAffectedSpecs({
      ...options,
      changedFiles: ['packages/web-vue/components/input/input.vue'],
    }).specs,
    [consumer, otherDependent, changed, sibling],
  );
});

test('includes a cross-component spec that imports changed source', () => {
  const source = 'packages/web-vue/components/table/table.vue';
  const tagSpec = 'components/tag/__test__/table-ellipsis.cy.ts';
  const tableSpec = 'components/table/__test__/index.cy.ts';
  const result = selectAffectedSpecs({
    changedFiles: [source],
    componentDependencies,
    componentSpecs: new Map([
      ['tag', [tagSpec, 'components/tag/__test__/index.cy.ts']],
      ['table', [tableSpec]],
    ]),
    browserReverse: new Map([[source, [`packages/web-vue/${tagSpec}`]]]),
  });
  assert.deepEqual(result.specs, [tableSpec, tagSpec]);
});

test('runs all tests for shared infrastructure changes', () => {
  assert.equal(select(['packages/web-vue/cypress/support/component.ts']).mode, 'all');
  assert.equal(select(['pnpm-lock.yaml']).mode, 'all');
});

test('dependency-only docs changes preserve component selection after dependency comparison', () => {
  const result = selectAffectedSpecs({
    changedFiles: [
      'package.json',
      'pnpm-lock.yaml',
      'packages/web-core/package.json',
      'packages/web-vue/package.json',
      'packages/web-vue/components/button/button.vue',
    ],
    componentDependencies,
    componentSpecs,
    dependencyChanges: false,
  });
  assert.deepEqual(result.components, ['button']);
  assert.equal(result.mode, 'affected');
});

test('docs E2E files and configs do not invalidate component tests', () => {
  assert.equal(
    select([
      'packages/web-vue/cypress/e2e/livecodes-docs.cy.ts',
      'packages/web-vue/cypress.markdown.config.ts',
      'packages/web-vue/cypress.theme.config.ts',
    ]).mode,
    'none',
  );
});

test('skips Cypress for unrelated repository changes', () => {
  assert.deepEqual(select(['README.md']), { mode: 'none', components: [], specs: [] });
});

test('runs all tests when explicitly requested', () => {
  assert.equal(select([], true).mode, 'all');
});

test('runs all tests for non-additive barrel changes', () => {
  // A modified/removed export or @use (removals present) can affect other
  // components, so barrels stay global unless the diff is purely additive.
  assert.equal(select(['packages/web-vue/components/index.ts']).mode, 'all');
  assert.equal(select(['packages/web-vue/components/index.scss']).mode, 'all');
});

test('selects only a newly added component when barrel registration is additive', () => {
  const specs = new Map([
    ['button', ['components/button/__test__/index.cy.ts']],
    ['selectable-card', ['components/selectable-card/__test__/index.cy.ts']],
  ]);
  const dependencies = new Map([
    ['button', new Set<string>()],
    ['selectable-card', new Set<string>()],
  ]);
  const result = selectAffectedSpecs({
    changedFiles: [
      'packages/web-vue/components/index.ts',
      'packages/web-vue/components/index.scss',
      'packages/web-vue/components/selectable-card/selectable-card.vue',
    ],
    componentDependencies: dependencies,
    componentSpecs: specs,
    additiveFiles: new Set([
      'packages/web-vue/components/index.ts',
      'packages/web-vue/components/index.scss',
    ]),
  });
  assert.deepEqual(result, {
    mode: 'affected',
    components: ['selectable-card'],
    specs: ['components/selectable-card/__test__/index.cy.ts'],
  });
});

test('ignores non-test-affecting root files like CHANGELOG.md', () => {
  // CHANGELOG.md lands alongside features via semantic-release but never
  // affects component tests; it must not force a full run.
  const result = select([
    'packages/web-vue/CHANGELOG.md',
    'packages/web-vue/components/button/button.vue',
  ]);
  assert.deepEqual(result, {
    mode: 'affected',
    components: ['button'],
    specs: ['components/button/__test__/index.cy.ts'],
  });
});

test('runs all tests for unrecognized root source changes', () => {
  // An icon SVG source or other unknown root file is conservatively global.
  assert.equal(select(['packages/web-vue/icon/_svgs/general/outline/bug.svg']).mode, 'all');
});

test('does not force a full run when only the selector script changes', () => {
  // The selector is validated by its unit tests, not by running every component
  // test - otherwise each iteration on the selection logic forces a full run.
  assert.equal(select(['packages/web-vue/scripts/find-affected-cypress-specs.ts']).mode, 'none');
  assert.equal(
    select(['packages/web-vue/scripts/find-affected-cypress-specs.test.ts']).mode,
    'none',
  );
});

test('does not expand runtime dependents through type-only imports', (t) => {
  // Keep the import graph independent of evolving component implementations.
  const temp = mkdtempSync(path.join(tmpdir(), 'affected-cypress-specs-'));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const root = path.join(temp, 'packages', 'web-vue');
  const sources = {
    scrollbar: 'export default {};',
    select: "import Scrollbar from '../scrollbar';",
    table: "import Scrollbar from '@components/scrollbar';",
    input: `import type { ScrollbarProps } from '../scrollbar';
export type { ScrollbarProps } from '@components/scrollbar';
import { type ScrollbarProps as Props } from '../scrollbar';
// import Scrollbar from '../scrollbar';
const example = "import Scrollbar from '../scrollbar'";`,
    button: `export { default as Scrollbar } from '../scrollbar';`,
    card: `<script setup lang="ts">import Scrollbar from '../scrollbar';</script>
<template><div>import Input from '../input'</div></template>
<style lang="scss">/* @use '../input'; */ @use '../scrollbar/style/index.scss';</style>`,
    popover: `const load = () => import( /* lazy */ \`../scrollbar\` ); const render = () => <div />;`,
  };
  for (const [name, source] of Object.entries(sources)) {
    const directory = path.join(root, 'components', name);
    mkdirSync(path.join(directory, '__test__'), { recursive: true });
    writeFileSync(
      path.join(
        directory,
        name === 'card' ? 'index.vue' : name === 'popover' ? 'index.tsx' : 'index.ts',
      ),
      source,
    );
    writeFileSync(path.join(directory, '__test__', 'index.cy.ts'), '');
  }
  const result = selectAffectedSpecs({
    ...discoverMetadata(temp),
    changedFiles: ['packages/web-vue/components/scrollbar/scrollbar.vue'],
  });
  assert.deepEqual(result.components, [
    'button',
    'card',
    'popover',
    'scrollbar',
    'select',
    'table',
  ]);
});

test('scopes Core component changes and retains full runs for shared infrastructure', () => {
  assert.deepEqual(select(['packages/web-core/styles/button/style/token.scss']).components, [
    'button',
  ]);
  assert.deepEqual(select(['packages/web-core/src/input/foundation.ts']).components, [
    'form',
    'input',
  ]);
  for (const file of [
    'packages/web-core/src/_utils/query.ts',
    'packages/web-core/styles/style/token.scss',
    'packages/web-core/scripts/theme-catalog.ts',
  ])
    assert.equal(select([file]).mode, 'all', file);
});

test('tracks cross-component Core runtime and stylesheet imports', (t) => {
  const temp = mkdtempSync(path.join(tmpdir(), 'affected-core-specs-'));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const root = path.join(temp, 'packages', 'web-vue');
  for (const name of ['checkbox', 'select', 'table']) {
    const directory = path.join(root, 'components', name, '__test__');
    mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(directory, 'index.cy.ts'), '');
  }
  for (const [file, source] of Object.entries({
    'src/checkbox/foundation.ts': 'export const x = 1;',
    'src/select/foundation.ts': "import { x } from '@sdata/web-core/checkbox/foundation';",
    'styles/select/style/index.scss': "@use '../../checkbox/style/index.scss';",
    'styles/checkbox/style/index.scss': '',
    'styles/table/style/index.scss': "@use '../../select/style/index.scss';",
    'tests/browser/hover-intent.ts': 'export const hover = () => {};',
    'tests/fixtures/checkbox-data.json': '{"checked":true}',
  })) {
    const target = path.join(temp, 'packages', 'web-core', file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, source);
  }
  writeFileSync(
    path.join(root, 'components', 'checkbox', '__test__', 'index.cy.ts'),
    [
      "import { hover } from '../../../../web-core/tests/browser/hover-intent';",
      "import data from '../../../../web-core/tests/fixtures/checkbox-data.json';",
      'if (data.checked) hover();',
    ].join('\n'),
  );
  const metadata = discoverMetadata(temp);
  const result = selectAffectedSpecs({
    ...metadata,
    changedFiles: ['packages/web-core/styles/checkbox/style/index.scss'],
  });
  assert.equal(result.mode, 'affected');
  assert.deepEqual(result.components, ['checkbox', 'select', 'table']);
  const helperChange = selectAffectedSpecs({
    ...metadata,
    changedFiles: ['packages/web-core/tests/browser/hover-intent.ts'],
  });
  assert.deepEqual(helperChange.specs, ['components/checkbox/__test__/index.cy.ts']);
  const fixtureChange = selectAffectedSpecs({
    ...metadata,
    changedFiles: ['packages/web-core/tests/fixtures/checkbox-data.json'],
  });
  assert.deepEqual(fixtureChange.specs, ['components/checkbox/__test__/index.cy.ts']);
  assert.equal(
    selectAffectedSpecs({
      ...metadata,
      changedFiles: ['packages/web-core/tests/browser/removed-helper.ts'],
    }).mode,
    'all',
  );
});
