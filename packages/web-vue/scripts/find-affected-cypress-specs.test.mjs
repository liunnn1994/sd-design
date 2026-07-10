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
const select = (changedFiles, forceAll = false) =>
  selectAffectedSpecs({ changedFiles, componentDependencies, componentSpecs, forceAll });

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
