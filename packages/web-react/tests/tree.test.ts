import { Tree as RootTree, ConfigProvider } from '@sdata/web-react';
import TreeDefault, { Tree } from '@sdata/web-react/tree';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

test('Tree public entries render expanded checked nodes and native attributes without browser globals', () => {
  assert.equal(RootTree, Tree);
  assert.equal(TreeDefault, Tree);
  const html = render(
    h(Tree, {
      'data': [{ key: 0, title: 'Root', children: [{ key: 'leaf', title: 'Leaf' }] }],
      'checkable': true,
      'defaultCheckedKeys': [0],
      'defaultExpandAll': true,
      'aria-label': 'Files',
      'id': 'files',
    }),
  );
  assert.match(html, /role="tree"/);
  assert.match(html, /aria-label="Files"/);
  assert.match(html, /id="files"/);
  assert.match(html, /data-key-type="number"/);
  assert.match(html, /Leaf/);
  assert.match(html, /checked=""/);
});
test('Tree honors the provider prefix and renders custom raw-node titles', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(Tree, {
        data: [{ key: 'one', title: 'One' }],
        renderTitle: (node) => h('b', null, node.title),
      }),
    ),
  );
  assert.match(html, /custom-tree-node/);
  assert.match(html, /<b>One<\/b>/);
});
