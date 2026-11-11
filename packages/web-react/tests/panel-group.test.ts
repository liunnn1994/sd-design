import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import Group, { Panel, PanelGroup, PanelSeparator } from '../dist/panel-group/index.js';

test('PanelGroup SSR renders custom tags, sized and pinned fill panels without callbacks', () => {
  let events = 0;
  const html = render(
    h(
      PanelGroup,
      { component: 'section', onMoveStart: () => events++ },
      h(Panel, { defaultSize: 200, onSizeChange: () => events++ }, 'Sidebar'),
      h(PanelSeparator, { ariaLabel: 'Resize navigation' }),
      h(Panel, { pin: true }, 'Content'),
    ),
  );
  assert.equal(Group, PanelGroup);
  assert.equal(events, 0);
  assert.match(html, /^<section/);
  assert.match(html, /sd-panel-content/);
  assert.match(html, /sd-panel-fill-inner/);
  assert.match(html, /role="separator"/);
  assert.match(html, /aria-orientation="vertical"/);
  assert.match(html, /aria-label="Resize navigation"/);
});

test('PanelGroup SSR exposes initial render state and omits initially collapsed content', () => {
  const html = render(
    h(
      PanelGroup,
      {},
      h(Panel, { defaultSize: 200, collapsed: true }, 'Hidden initially'),
      h(Panel, {}, ({ collapsed, dragging, folding }) => `${collapsed}/${dragging}/${folding}`),
    ),
  );
  assert.doesNotMatch(html, /Hidden initially/);
  assert.match(html, /false\/false\/false/);
});

test('PanelGroup SSR supports vertical custom grips and nested groups', () => {
  const html = render(
    h(
      PanelGroup,
      { orientation: 'vertical' },
      h(Panel, { defaultSize: 50 }, 'Header'),
      h(PanelSeparator, {}, h('strong', {}, 'Custom grip')),
      h(Panel, {}, h(PanelGroup, {}, h(Panel, {}, 'Nested'))),
    ),
  );
  assert.match(html, /aria-orientation="horizontal"/);
  assert.match(html, /<strong>Custom grip<\/strong>/);
  assert.doesNotMatch(html, /<svg/);
  assert.equal((html.match(/overflow:clip/g) ?? []).length, 1);
});

test('Panel and PanelSeparator reject missing group context', () => {
  assert.throws(() => render(h(Panel, {}, 'Orphan')), /inside PanelGroup/);
  assert.throws(() => render(h(PanelSeparator)), /inside PanelGroup/);
});

test('PanelGroup SSR hides disabled separators before client effects run', () => {
  const html = render(h(PanelGroup, { disabled: true }, h(PanelSeparator)));
  assert.match(html, /display:none/);
});
