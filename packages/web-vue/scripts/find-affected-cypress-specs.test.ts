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

test('runs all tests for shared infrastructure changes', () => {
  assert.equal(select(['packages/web-vue/cypress/support/component.ts']).mode, 'all');
  assert.equal(select(['pnpm-lock.yaml']).mode, 'all');
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
  const root = mkdtempSync(path.join(tmpdir(), 'affected-cypress-specs-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const sources = {
    scrollbar: 'export default {};',
    select: "import Scrollbar from '../scrollbar';",
    table: "import Scrollbar from '@components/scrollbar';",
    input: `import type { ScrollbarProps } from '../scrollbar';
export type { ScrollbarProps } from '@components/scrollbar';`,
  };
  for (const [name, source] of Object.entries(sources)) {
    const directory = path.join(root, 'components', name);
    mkdirSync(path.join(directory, '__test__'), { recursive: true });
    writeFileSync(path.join(directory, 'index.ts'), source);
    writeFileSync(path.join(directory, '__test__', 'index.cy.ts'), '');
  }
  const result = selectAffectedSpecs({
    ...discoverMetadata(root),
    changedFiles: ['packages/web-vue/components/scrollbar/scrollbar.vue'],
  });
  assert.deepEqual(result.components, ['scrollbar', 'select', 'table']);
});

test('shared foundation, Sass and generation changes invalidate component consumers', () => {
  for (const file of [
    'packages/web-core/src/table/query.ts',
    'packages/web-core/styles/button/style/token.scss',
    'packages/web-core/scripts/theme-catalog.ts',
    'packages/web-core/package.json',
  ])
    assert.equal(select([file]).mode, 'all', file);
});
