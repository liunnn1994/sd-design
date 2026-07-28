import assert from 'node:assert/strict';
import test from 'node:test';

import { filterResolverCommits } from './path-scoped-release.mjs';

test('keeps only commits that modify auto-import-resolver', () => {
  const commits = [
    { hash: 'component', message: 'feat: add component functionality' },
    { hash: 'mixed', message: 'fix: update resolver and documentation' },
    { hash: 'resolver', message: 'fix: update resolver behavior' },
  ];
  const changedFiles = new Map([
    ['component', ['packages/web-vue/components/select/select.tsx']],
    [
      'mixed',
      [
        'packages/sd-vue-docs/src/content/docs/components/select/index.mdx',
        'packages/auto-import-resolver/index.ts',
      ],
    ],
    ['resolver', ['packages/auto-import-resolver/release.config.mjs']],
  ]);

  assert.deepEqual(
    filterResolverCommits(commits, (hash) => changedFiles.get(hash) ?? []),
    [commits[1], commits[2]],
  );
});

test('excludes component catalog changes because exports are discovered at runtime', () => {
  const commits = [{ hash: 'new-component', message: 'feat: add a component' }];

  assert.deepEqual(
    filterResolverCommits(commits, () => [
      'packages/web-vue/components/new-component/index.ts',
      'packages/web-vue/components/index.ts',
    ]),
    [],
  );
});
