import { TreeSelect as RootTreeSelect, ConfigProvider } from '@sdata/web-react';
import TreeSelectDefault, { TreeSelect } from '@sdata/web-react/tree-select';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
test('TreeSelect public entries render selected numeric values with tree combobox semantics', () => {
  assert.equal(TreeSelectDefault, TreeSelect);
  assert.equal(RootTreeSelect, TreeSelect);
  const html = render(
    h(TreeSelect, { 'data': [{ key: 0, title: 'Zero' }], 'defaultValue': 0, 'aria-label': 'Team' }),
  );
  assert.match(html, /Zero/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-haspopup="tree"/);
  assert.match(html, /aria-label="Team"/);
});
test('TreeSelect SSR custom trigger receives selected options and provider prefix', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(TreeSelect, {
        options: [{ key: 'one', title: 'One' }],
        defaultValue: 'one',
        renderTrigger: (state) =>
          h('button', null, `${state.displayValue}:${state.selectedOptions[0]?.key}`),
      }),
    ),
  );
  assert.match(html, /One:one/);
});
