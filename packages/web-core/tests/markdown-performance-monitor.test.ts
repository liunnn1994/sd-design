import assert from 'node:assert/strict';
import test from 'node:test';

import * as shared from '../src/markdown/performance-monitor.ts';

type Client = typeof shared;
const native = (await import(
  new URL('../../web-vue/node_modules/markstream-vue/dist/index.js', import.meta.url).href
)) as Client;
const metric = (type: 'worker' | 'direct' | 'cache-hit', duration: number, success = true) => ({
  type,
  duration,
  success,
  formulaLength: 5,
  timestamp: 10,
});
function compare(profile: (client: Client) => unknown) {
  const values = [native, shared].map((client) => {
    client.disablePerfMonitoring();
    client.perfMonitor.reset();
    try {
      return profile(client);
    } finally {
      client.disablePerfMonitoring();
      client.perfMonitor.reset();
    }
  });
  assert.deepEqual(values[1], values[0]);
}
test('Markdown performance monitor preserves empty stats, disabled recording and reset state', () => {
  compare((client) => {
    const monitor = client.perfMonitor;
    monitor.recordRender(metric('direct', 20));
    const stats = [monitor.getStats()];
    client.enablePerfMonitoring();
    monitor.recordRender(metric('worker', 5));
    stats.push(monitor.getStats());
    monitor.reset();
    monitor.recordRender(metric('direct', 10));
    stats.push(monitor.getStats());
    client.disablePerfMonitoring();
    monitor.recordRender(metric('direct', 100));
    stats.push(monitor.getStats());
    return stats;
  });
});
test('Markdown performance stats preserve failure, hit and duration calculations', () => {
  compare((client) => {
    client.enablePerfMonitoring();
    for (const item of [
      metric('worker', 10),
      metric('worker', 30),
      metric('direct', 15),
      metric('cache-hit', 0.1234),
      metric('cache-hit', 0.3, false),
      metric('worker', 200, false),
      metric('direct', 500, false),
    ])
      client.perfMonitor.recordRender(item);
    return client.perfMonitor.getStats();
  });
});
test('Markdown performance recommendations match each native branch and strict thresholds', () => {
  compare((client) => {
    client.enablePerfMonitoring();
    return [
      [
        metric('worker', 1),
        metric('direct', 10),
        ...Array.from({ length: 8 }, () => metric('cache-hit', 0.1)),
      ],
      [
        metric('worker', 100),
        metric('direct', 10),
        ...Array.from({ length: 3 }, () => metric('cache-hit', 0.1)),
      ],
      [metric('worker', 40), metric('direct', 10)],
      [metric('worker', 12), metric('direct', 4)],
      [metric('worker', 15), metric('direct', 5)],
      Array.from({ length: 3 }, () => metric('worker', 50, false)),
    ].map((items) => {
      client.perfMonitor.reset();
      for (const item of items) client.perfMonitor.recordRender(item);
      return client.perfMonitor.getStats();
    });
  });
});
test('Markdown performance history evicts the oldest entry after 1000 records', () => {
  compare((client) => {
    client.enablePerfMonitoring();
    for (let index = 0; index < 1003; index++)
      client.perfMonitor.recordRender({ ...metric('direct', index), timestamp: index });
    const { metrics, stats } = client.perfMonitor.exportMetrics();
    assert.equal(metrics.length, 1000);
    assert.equal(metrics[0].timestamp, 3);
    return { metrics, stats };
  });
});
test('Markdown performance exports copy the list, retain metric identity and timestamp at export', () => {
  compare((client) => {
    client.enablePerfMonitoring();
    const item = metric('direct', 1);
    client.perfMonitor.recordRender(item);
    const now = Date.now;
    Date.now = () => 1234;
    try {
      const first = client.perfMonitor.exportMetrics();
      assert.equal(first.metrics[0], item);
      first.metrics.push(metric('worker', 100));
      item.duration = 2;
      return client.perfMonitor.exportMetrics();
    } finally {
      Date.now = now;
    }
  });
});
test('Markdown performance report returns stats and preserves console grouping', () => {
  compare((client) => {
    const group = console.group,
      end = console.groupEnd,
      calls: unknown[] = [];
    console.group = (...args) => {
      calls.push(args);
    };
    console.groupEnd = () => {
      calls.push('end');
    };
    try {
      client.enablePerfMonitoring();
      client.perfMonitor.recordRender(metric('direct', 10));
      return { report: client.getPerfReport(), calls };
    } finally {
      console.group = group;
      console.groupEnd = end;
    }
  });
});
