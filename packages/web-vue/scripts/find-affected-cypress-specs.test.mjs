import assert from 'node:assert/strict';
import test from 'node:test';

import { selectAffectedSpecs } from './find-affected-cypress-specs.mjs';

const componentSpecs = new Map([
  ['button', ['components/button/__test__/index.cy.ts']],
  ['form', ['components/form/__test__/index.cy.ts']],
  ['input', ['components/input/__test__/index.cy.ts']],
]);
const componentDependencies = new Map([
  ['button', new Set()],
  ['form', new Set(['input'])],
  ['input', new Set()],
]);
const select = (changedFiles, forceAll = false, additiveFiles = new Set()) =>
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
    ['button', new Set()],
    ['selectable-card', new Set()],
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
