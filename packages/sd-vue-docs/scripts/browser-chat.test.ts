import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createBrowserChat } from '../src/components/home/browser-chat.ts';

test('unsupported browsers use the same fallback and can restart after disposal', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator')!;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { gpu: undefined } });
  t.after(() => Object.defineProperty(globalThis, 'navigator', descriptor));
  const chat = createBrowserChat('react');
  let notifications = 0;
  const unsubscribe = chat.subscribe(() => notifications++);
  chat.start();
  assert.equal(chat.getSnapshot().supported, false);
  chat.send('Sender 如何使用？');
  assert.equal(chat.getSnapshot().messages.length, 4);
  assert.match(chat.getSnapshot().messages.at(-1)!.content, /示例/);
  assert.equal(chat.getSnapshot().replying, false);
  chat.dispose();
  chat.start();
  chat.send('MarkdownRender');
  assert.equal(chat.getSnapshot().messages.length, 6);
  assert.ok(notifications > 0);
  unsubscribe();
  chat.dispose();
});

test('cancel and dispose stop pending preparation without downloading a model', async (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator')!;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { gpu: {} } });
  t.after(() => Object.defineProperty(globalThis, 'navigator', descriptor));
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { setTimeout, clearTimeout },
  });
  t.after(() => {
    Reflect.deleteProperty(globalThis, 'window');
  });
  const fetch = t.mock.method(globalThis, 'fetch', () => new Promise<Response>(() => {}));
  const chat = createBrowserChat();
  chat.start();
  assert.equal(chat.getSnapshot().preparing, true);
  chat.stop();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(chat.getSnapshot().busy, false);
  assert.match(chat.getSnapshot().error, /已停止/);
  chat.dispose();
  chat.start();
  assert.equal(chat.getSnapshot().busy, true);
  chat.dispose();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(chat.getSnapshot().busy, false);
  assert.equal(fetch.mock.callCount(), 2);
});
