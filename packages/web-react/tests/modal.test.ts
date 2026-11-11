import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { Modal, ConfigProvider, useModal } from '../dist/index.js';
test('Modal keeps portals client-only during SSR, including initial visibility', () => {
  assert.equal(render(h(Modal, { title: 'Hidden', defaultVisible: true }, 'Content')), '');
  assert.equal(
    render(h(ConfigProvider, { modal: { width: 400 } }, h(Modal, { visible: true }, 'Content'))),
    '',
  );
});
test('Modal holder is SSR-safe and exports the same imperative method family', () => {
  function Owner() {
    const [api, holder] = useModal();
    for (const name of [
      'open',
      'confirm',
      'info',
      'success',
      'warning',
      'error',
      'config',
      'destroyAll',
    ] as const)
      assert.equal(typeof api[name], 'function');
    return holder;
  }
  assert.equal(render(h(Owner)), '');
  assert.equal(Modal.useModal, useModal);
});
