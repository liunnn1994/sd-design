import { getCustomNodeComponents, renderNode } from 'markstream-react';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  MarkdownComponentsContext,
  useMarkdownComponents,
} from '../dist/markdown-render/context.js';

test('Markdown local defaults and inherited mappings render on the server without mutating upstream defaults', () => {
  const before = { ...getCustomNodeComponents() };
  function LocalRenderer() {
    const customComponents = useMarkdownComponents();
    return renderNode(
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', content: 'Default heading', raw: 'Default heading' }],
        raw: '## Default heading',
      },
      'ssr',
      { customComponents, events: {} },
    );
  }
  assert.match(renderToStaticMarkup(h(LocalRenderer)), /<h2[^>]*sd-typography/);
  const inherited = renderToStaticMarkup(
    h(
      MarkdownComponentsContext,
      { value: { heading: () => h('h2', { className: 'inherited' }, 'Caller') } },
      h(LocalRenderer),
    ),
  );
  assert.equal(inherited, '<h2 class="inherited">Caller</h2>');
  assert.deepEqual(getCustomNodeComponents(), before);
});
