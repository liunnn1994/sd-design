import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Skeleton, SkeletonLine, SkeletonShape } from '../dist/index.js';

test('skeleton renders only the active branch and exposes its compound components', () => {
  const loading = renderToStaticMarkup(
    createElement(
      Skeleton,
      { animation: true, content: 'Ready' },
      createElement(SkeletonLine, { rows: 2, widths: [80] }),
    ),
  );
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /sd-skeleton-animation/);
  assert.match(loading, /width:80px/);
  assert.doesNotMatch(loading, /Ready/);
  const ready = renderToStaticMarkup(
    createElement(Skeleton, { loading: false, content: 'Ready' }, 'Loading'),
  );
  assert.match(ready, /Ready/);
  assert.doesNotMatch(ready, /aria-busy|Loading/);
  assert.equal(Skeleton.Line, SkeletonLine);
  assert.equal(Skeleton.Shape, SkeletonShape);
  assert.match(
    renderToStaticMarkup(createElement(SkeletonShape)),
    /sd-skeleton-shape-square sd-skeleton-shape-medium/,
  );
});
