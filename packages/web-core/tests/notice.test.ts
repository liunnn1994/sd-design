import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { NoticeConfig, NoticeItem } from '../src/notice/types.ts';

import { createNoticeQueue } from '../dist/notice/queue.js';
import { createNoticeService, resolveNoticeConfig } from '../dist/notice/service.js';
import { createNoticeTimer } from '../dist/notice/timer.js';

function queue(kind: 'message' | 'notification' = 'message') {
  const items: NoticeItem[] = [];
  const calls: string[] = [];
  const state = { alive: true, connected: true };
  const f = createNoticeQueue<NoticeConfig, NoticeItem>(kind, {
    items,
    get alive() {
      return state.alive;
    },
    get connected() {
      return state.connected;
    },
    create(config) {
      return config;
    },
    destroy() {
      state.alive = false;
      calls.push('destroy');
    },
    onDestroy() {
      calls.push('release');
    },
  });
  return { f, items, calls, state };
}

test('notice ids count every call, avoid generated collisions and update a matching explicit id', () => {
  const { f, items } = queue();
  f.add({ id: '__sd_message_2', content: 'Explicit' });
  f.add({ content: 'Generated' });
  assert.deepEqual(
    items.map((item) => item.id),
    ['__sd_message_2', '__sd_message_3'],
  );
  const identity = items[0];
  f.add({ id: '__sd_message_2', content: 'Updated' });
  assert.equal(items.length, 2);
  assert.equal(items[0], identity);
  assert.equal(items[0].content, 'Updated');
  f.add({ content: 'Next' });
  assert.equal(items[2].id, '__sd_message_5');
});

test('Message and Notification keep their different update reset rules', () => {
  const message = queue(),
    notification = queue('notification');
  for (const { f } of [message, notification]) {
    f.add({ id: 'one', content: 'Original', resetOnUpdate: true });
    f.add({ id: 'one', content: 'Next' });
  }
  assert.equal(message.items[0].resetOnUpdate, false);
  assert.equal(notification.items[0].resetOnUpdate, true);
  notification.f.add({ id: 'one', content: 'Timed', duration: 100, resetOnUpdate: false });
  assert.equal(notification.items[0].resetOnUpdate, false);
  message.f.add({ id: 'one', content: 'Timed', duration: 0 });
  assert.equal(message.items[0].resetOnUpdate, true);
});

test('notice reuse uses identity, type policy and notification title while only updating duration/version', () => {
  const content = () => 'opaque render content';
  for (const kind of ['message', 'notification'] as const) {
    const { f, items } = queue(kind);
    f.add({ content, title: 'Original', type: 'info', duration: 100, deduplicate: true });
    assert.equal(f.reuse({ content: () => 'opaque render content', title: 'Original' }), undefined);
    assert.equal(
      f.reuse({ content, title: 'Original', type: 'error', deduplicateByType: true }),
      undefined,
    );
    const reused = f.reuse({ content, title: 'Changed', type: 'error', duration: 200 });
    assert.equal(Boolean(reused), kind === 'message');
    f.reuse({ content, title: 'Original', type: 'error', duration: 300 });
    assert.equal(items[0].type, 'info');
    assert.equal(items[0].title, 'Original');
    assert.equal(items[0].duration, 300);
    assert.equal(items[0].timerVersion, kind === 'message' ? 2 : 1);
  }
});

test('updating deduplication membership and removing preserve callback receiver and reentrant insertion', () => {
  const { f, items } = queue();
  let seen: unknown;
  const handle = f.add({ id: 'one', content: 'Same', deduplicate: true });
  f.add({ id: 'one', content: 'Same', deduplicate: false });
  assert.equal(f.reuse({ content: 'Same' }), undefined);
  f.add({ id: 'one', content: 'Same', deduplicate: true });
  const item = items[0];
  item.onClose = function (id) {
    assert.equal(this, item);
    seen = items.length;
    f.add({ id, content: 'New item' });
  };
  handle.close();
  assert.equal(seen, 0);
  assert.equal(items.length, 1);
  assert.equal(items[0].content, 'New item');
  handle.close();
  assert.equal(items.length, 0);
});

test('bulk clear is silent and transition destruction only disposes an empty live manager', () => {
  const { f, items, calls, state } = queue();
  let closed = 0;
  f.add({ content: 'One' });
  items[0].onClose = () => closed++;
  f.destroy();
  assert.deepEqual(calls, []);
  f.clear();
  assert.equal(closed, 0);
  assert.equal(f.reuse({ content: 'One' }), undefined);
  state.connected = false;
  assert.equal(f.isDisconnected(), true);
  f.destroy();
  f.destroy();
  assert.deepEqual(calls, ['destroy', 'release']);
});

test('service cleans disconnected managers before searching across positions for reuse', () => {
  type Config = NoticeConfig & { position?: 'top' | 'bottom' };
  const managers: ReturnType<typeof queue>[] = [];
  const contexts: string[] = [];
  const service = createNoticeService<'top' | 'bottom', Config, string>({
    defaultPosition: 'top',
    create(config, context) {
      const manager = queue();
      managers.push(manager);
      contexts.push(context);
      return {
        ...manager.f,
        destroy() {
          manager.f.destroy();
          if (!manager.state.alive) service.release(config.position ?? 'top');
        },
      };
    },
  });
  service.open({ content: 'Same', deduplicate: true }, 'first');
  const reused = service.open({ content: 'Same', position: 'bottom', deduplicate: true }, 'second');
  assert.equal(managers.length, 1);
  assert.equal(managers[0].items[0].timerVersion, 1);
  reused.close();
  service.open({ content: 'Next' }, 'third');
  managers[0].state.connected = false;
  service.open({ content: 'After disconnect', deduplicate: true }, 'fresh');
  assert.equal(managers.length, 2);
  assert.deepEqual(managers[0].calls, ['destroy', 'release']);
  assert.deepEqual(contexts, ['first', 'fresh']);
  service.open(
    { id: 'explicit', content: 'After disconnect', position: 'bottom', deduplicate: true },
    'bottom',
  );
  assert.equal(managers.length, 3);
  service.remove('explicit');
  assert.equal(managers[2].items.length, 0);
  service.clear('top');
  assert.equal(managers[1].items.length, 0);
});

test('notice configuration precedence preserves type overrides and opaque content', () => {
  const content = () => 'VNode adapter';
  assert.deepEqual(resolveNoticeConfig('info', 'Text'), {
    type: 'info',
    content: 'Text',
    deduplicate: false,
    deduplicateByType: true,
  });
  const config = resolveNoticeConfig(
    'info',
    { content, type: 'error', deduplicate: false },
    { deduplicate: true, deduplicateByType: false },
  );
  assert.equal(config.content, content);
  assert.equal(config.type, 'error');
  assert.equal(config.deduplicate, false);
  assert.equal(config.deduplicateByType, false);
});

function timer() {
  const state = { duration: 100, reset: false, hover: true };
  const tasks = new Map<number, { callback: () => void; duration: number }>();
  const cancelled: number[] = [];
  let id = 0,
    closed = 0;
  const f = createNoticeTimer({
    get duration() {
      return state.duration;
    },
    get resetOnUpdate() {
      return state.reset;
    },
    get resetOnHover() {
      return state.hover;
    },
    schedule(callback, duration) {
      tasks.set(++id, { callback, duration });
      return id;
    },
    cancel(handle) {
      cancelled.push(handle);
      tasks.delete(handle);
    },
    onClose() {
      closed++;
    },
  });
  return {
    f,
    state,
    tasks,
    cancelled,
    get closed() {
      return closed;
    },
  };
}

test('notice timer uses mount/update/version requests and keeps manual close independent of timer disposal', () => {
  const t = timer();
  t.f.start();
  t.f.updated();
  assert.equal(t.tasks.size, 1);
  t.f.close();
  assert.equal(t.closed, 1);
  assert.equal(t.tasks.size, 1);
  t.state.reset = true;
  t.state.duration = 200;
  t.f.updated();
  assert.deepEqual(t.cancelled, [1]);
  assert.equal(t.tasks.get(2)?.duration, 200);
  t.state.duration = 0;
  t.f.restart();
  assert.equal(t.tasks.size, 0);
  t.f.clear();
  assert.deepEqual(t.cancelled, [1, 2]);
});

test('hover reset cancels while entered, restarts a full duration on leave and reads current policy', () => {
  const t = timer();
  t.f.start();
  t.f.enter();
  t.f.restart();
  assert.equal(t.tasks.size, 0);
  t.f.leave();
  assert.equal(t.tasks.get(2)?.duration, 100);
  t.state.hover = false;
  t.f.enter();
  t.f.leave();
  assert.equal(t.tasks.size, 1);
  t.tasks.get(2)!.callback();
  assert.equal(t.closed, 1);
  t.f.clear();
  assert.deepEqual(t.cancelled, [1, 2]);
});
