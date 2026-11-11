import {
  Cascader as RootCascader,
  CascaderPanel as RootPanel,
  ConfigProvider,
} from '@sdata/web-react';
import CascaderDefault, { Cascader, CascaderPanel } from '@sdata/web-react/cascader';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

const options = [{ value: 'root', label: 'Root', children: [{ value: 'leaf', label: 'Leaf' }] }];

test('Cascader public entries share identities and render selected paths on the server', () => {
  assert.equal(RootCascader, Cascader);
  assert.equal(CascaderDefault, Cascader);
  assert.equal(RootPanel, CascaderPanel);
  assert.equal(Cascader.CascaderPanel, CascaderPanel);
  const html = render(h(Cascader, { options, 'defaultValue': 'leaf', 'aria-label': 'Location' }));
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-label="Location"/);
  assert.match(html, /Root \/ Leaf/);
});

test('CascaderPanel renders options, native attributes and provider prefix without DOM globals', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(CascaderPanel, {
        options,
        'id': 'locations',
        'className': 'extra',
        'aria-label': 'Locations',
      }),
    ),
  );
  assert.match(html, /id="locations"/);
  assert.match(html, /aria-label="Locations"/);
  assert.match(html, /custom-cascader/);
  assert.match(html, /extra/);
  assert.match(html, /Root/);
});
