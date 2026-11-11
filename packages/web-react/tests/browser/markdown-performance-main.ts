import * as core from '@sdata/web-core/markdown/performance-monitor';

import * as monitor from '../../src/markdown-render/performance-monitor.js';

const api = {
  ...monitor,
  coreMonitor: core.perfMonitor,
  loadFacade: () => import('../../src/markdown-render/upstream.js'),
};
Object.assign(window, { markdownPerformanceApi: api });
export type MarkdownPerformanceTestApi = typeof api;
