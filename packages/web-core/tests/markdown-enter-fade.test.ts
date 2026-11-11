import assert from 'node:assert/strict';
import test from 'node:test';

import { getMarkdownFadeTimeout } from '../dist/markdown/enter-fade.js';

test('Markdown fade timeout follows CSS duration lists, repeated delays and milliseconds', () => {
  assert.equal(getMarkdownFadeTimeout({ transitionDuration: '0.28s', transitionDelay: '0s' }), 280);
  assert.equal(
    getMarkdownFadeTimeout({
      transitionDuration: '100ms, .2s, 50ms',
      transitionDelay: '20ms, .1s',
    }),
    300,
  );
  assert.equal(getMarkdownFadeTimeout({ transitionDuration: '0s', transitionDelay: '0s' }), 0);
  assert.equal(
    getMarkdownFadeTimeout({ transitionDuration: '1s, .2s', transitionDelay: '-.2s' }),
    800,
  );
});
