import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  Message,
  Notification,
  useMessage,
  useNotification,
  MESSAGE_POSITION,
  NOTIFICATION_POSITION,
} from '../dist/index.js';
import DefaultMessage from '../dist/message/index.js';
import DefaultNotification from '../dist/notification/index.js';

test('notice static APIs and hooks are safe to import and render without a document', () => {
  assert.equal(Message, DefaultMessage);
  assert.equal(Notification, DefaultNotification);
  assert.deepEqual(MESSAGE_POSITION, ['top', 'bottom']);
  assert.equal(NOTIFICATION_POSITION.length, 4);
  Message.info('SSR').close();
  Notification.success({ content: 'SSR' }).close();
  function Fixture() {
    const [message, messages] = useMessage();
    const [notification, notifications] = useNotification();
    assert.equal(typeof message.clear, 'function');
    assert.equal(typeof notification.remove, 'function');
    return h('div', {}, messages, notifications);
  }
  assert.equal(renderToStaticMarkup(h(Fixture)), '<div></div>');
});
