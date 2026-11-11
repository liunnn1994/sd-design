import * as core from '@sdata/web-core/markdown/performance-monitor';
import assert from 'node:assert/strict';
import test from 'node:test';

import * as adapter from '../dist/markdown-render/performance-monitor.js';

test('React performance controls retain the Core singleton during server imports', () => {
  assert.equal(adapter.perfMonitor, core.perfMonitor);
  assert.equal(adapter.enablePerfMonitoring, core.enablePerfMonitoring);
  assert.equal(adapter.disablePerfMonitoring, core.disablePerfMonitoring);
  assert.equal(adapter.getPerfReport, core.getPerfReport);
  assert.equal(typeof window, 'undefined');
  adapter.perfMonitor.reset();
  adapter.enablePerfMonitoring();
  try {
    adapter.perfMonitor.recordRender({
      type: 'worker',
      duration: 10,
      success: true,
      formulaLength: 3,
      timestamp: 1,
    });
    assert.equal(core.perfMonitor.getStats().totalRenders, 1);
  } finally {
    adapter.disablePerfMonitoring();
    adapter.perfMonitor.reset();
  }
});
