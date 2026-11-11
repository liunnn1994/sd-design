import assert from 'node:assert/strict';
import { test } from 'node:test';

import { frameworkHref, getFrameworkLinks } from '../src/utils/framework-navigation.ts';

const paths = new Set(['', 'components/divider', 'react', 'react/components/divider']);

test('switches component routes in both directions', () => {
  assert.deepEqual(getFrameworkLinks('/components/divider/', paths), {
    isReact: false,
    vueHref: '/components/divider/',
    reactHref: '/react/components/divider/',
  });
  assert.deepEqual(getFrameworkLinks('/react/components/divider', paths), {
    isReact: true,
    vueHref: '/components/divider/',
    reactHref: '/react/components/divider/',
  });
});

test('switching guides preserves the deployment base and section', () => {
  const routes = new Set(['guides/theme', 'react/guides/theme']);
  assert.deepEqual(
    getFrameworkLinks('/design/react/guides/theme/', routes, {
      base: '/design/',
      hash: '#tokens',
    }),
    {
      isReact: true,
      vueHref: '/design/guides/theme/#tokens',
      reactHref: '/design/react/guides/theme/#tokens',
    },
  );
});

test('framework hrefs are idempotent and keep section links', () => {
  assert.equal(frameworkHref('/components/button#api', 'react'), '/react/components/button/#api');
  assert.equal(frameworkHref('/react/components/button/', 'react'), '/react/components/button/');
  assert.equal(frameworkHref('/', 'react', '/design/'), '/design/react/');
  assert.equal(frameworkHref('/react/', 'vue'), '/');
  assert.equal(
    frameworkHref('/components/button/?size=small#api', 'react'),
    '/react/components/button/?size=small#api',
  );
  assert.equal(
    frameworkHref('/llms/components/button.md', 'react'),
    '/react/llms/components/button.md',
  );
});

test('missing counterpart uses framework overview and overview never becomes a protocol-relative URL', () => {
  assert.equal(getFrameworkLinks('/components/table/', paths).reactHref, '/react/');
  assert.equal(getFrameworkLinks('/react/components/missing/', paths).vueHref, '/');
  assert.equal(getFrameworkLinks('/react/', paths).vueHref, '/');
  assert.equal(getFrameworkLinks('/', paths).reactHref, '/react/');
});
