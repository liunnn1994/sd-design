import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getMarkdownLinkData, getMarkdownLinkLoadingStyle } from '../dist/markdown/link.js';

test('markdown link data preserves node precedence and enforces the existing safe URL/rel contract', () => {
  const link = getMarkdownLinkData(
    {
      href: 'https://example.com',
      attrs: [
        ['class', 'node'],
        ['rel', 'opener author'],
      ],
    },
    { class: 'host', onclick: 'bad()', style: 'color:red' },
  );
  assert.equal(link.attrs.class, 'node');
  assert.equal(link.attrs.onclick, undefined);
  assert.equal(link.attrs.style, undefined);
  assert.equal(link.href, 'https://example.com');
  assert.equal(link.target, '_blank');
  assert.equal(link.rel, 'author noopener noreferrer');
  assert.equal(getMarkdownLinkData({ href: '#anchor' }).target, undefined);
  assert.equal(getMarkdownLinkData({ href: 'javascript:alert(1)' }).href, undefined);
});

test('markdown links preserve explicit targets and de-duplicate safe relation tokens', () => {
  const link = getMarkdownLinkData({
    href: '/path',
    attrs: [
      ['target', '_blank'],
      ['rel', 'noopener noreferrer noopener OPENER'],
    ],
  });
  assert.equal(link.target, '_blank');
  assert.equal(link.rel, 'noopener noreferrer');
  assert.equal(
    getMarkdownLinkData({ href: 'https://example.com', attrs: [['target', '_self']] }).target,
    '_self',
  );
});

test('markdown loading links keep source animation defaults and CSS units', () => {
  const defaults = getMarkdownLinkLoadingStyle({});
  assert.equal(defaults['--sd-markdown-link-underline-height'], '2px');
  assert.equal(defaults['--sd-markdown-link-underline-bottom'], '-3px');
  assert.equal(defaults['--sd-markdown-link-rest-opacity'], '0.175');
  const custom = getMarkdownLinkLoadingStyle({
    color: 'red',
    underlineBottom: '0.2em',
    animationDuration: 2,
    animationOpacity: 0.1,
    animationIteration: 3,
  });
  assert.equal(custom.color, 'red');
  assert.equal(custom['--sd-markdown-link-underline-bottom'], '0.2em');
  assert.equal(custom['--sd-markdown-link-duration'], '2s');
  assert.equal(custom['--sd-markdown-link-rest-opacity'], '0.12');
  assert.equal(custom['--sd-markdown-link-iteration'], '3');
});
