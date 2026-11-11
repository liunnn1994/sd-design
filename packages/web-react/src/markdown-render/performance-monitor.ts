import { getPerfReport, perfMonitor } from '@sdata/web-core/markdown/performance-monitor';

export {
  enablePerfMonitoring,
  disablePerfMonitoring,
  getPerfReport,
  perfMonitor,
} from '@sdata/web-core/markdown/performance-monitor';

if (typeof window !== 'undefined') {
  Object.assign(window, { __katexPerfReport: getPerfReport, __katexPerfMonitor: perfMonitor });
}
