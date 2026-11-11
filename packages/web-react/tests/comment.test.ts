import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Comment } from '../dist/index.js';

test('comment renders avatar, author, content and independently aligned actions', () => {
  const html = renderToStaticMarkup(
    createElement(Comment, {
      avatar: '/avatar.png',
      author: '作者',
      datetime: '今天',
      content: '内容',
      align: { actions: 'right' },
      actions: createElement('button', null, '回复'),
    }),
  );
  assert.match(html, /alt="comment-avatar"/);
  assert.match(html, /src="\/avatar.png"/);
  assert.match(html, /sd-comment-title-align-left/);
  assert.match(html, /sd-comment-actions-align-right/);
  assert.match(html, /作者/);
  assert.match(html, /今天/);
  assert.match(html, /内容/);
  assert.match(html, /<button>回复<\/button>/);
});

test('comment supports custom render content and nested replies', () => {
  const html = renderToStaticMarkup(
    createElement(
      Comment,
      {
        author: createElement('a', { href: '/user' }, '作者'),
        avatar: createElement('span', null, '头像'),
        align: 'right',
      },
      createElement(Comment, { content: '嵌套回复' }),
    ),
  );
  assert.match(html, /href="\/user"/);
  assert.match(html, /sd-comment-inner-comment/);
  assert.match(html, /嵌套回复/);
  assert.match(html, /sd-comment-title-align-right/);
  assert.doesNotMatch(html, /<img/);
});

test('empty comment omits optional regions', () => {
  const html = renderToStaticMarkup(createElement(Comment));
  assert.doesNotMatch(html, /sd-comment-(avatar|title|actions|inner-comment)/);
});

test('numeric zero stays inside its content region instead of leaking into the layout', () => {
  const html = renderToStaticMarkup(createElement(Comment, { author: 0, content: 0 }));
  assert.match(html, /class="sd-comment-author">0<\/span>/);
  assert.match(html, /class="sd-comment-content">0<\/div>/);
});
