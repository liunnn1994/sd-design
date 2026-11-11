interface RenderMetrics {
  type: 'worker' | 'direct' | 'cache-hit';
  duration: number;
  formulaLength: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: RenderMetrics[] = [];
  private enabled = false;
  private maxMetrics = 1000;

  enable() {
    this.enabled = true;
  }
  disable() {
    this.enabled = false;
  }
  recordRender(metric: RenderMetrics) {
    if (!this.enabled) return;
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) this.metrics.shift();
  }
  getStats() {
    if (!this.metrics.length)
      return {
        totalRenders: 0,
        cacheHitRate: 0,
        averageWorkerTime: 0,
        averageDirectTime: 0,
        averageCacheHitTime: 0,
        workerSavings: 0,
        recommendation: 'Insufficient data',
      };
    const workers = this.metrics.filter((metric) => metric.type === 'worker' && metric.success);
    const direct = this.metrics.filter((metric) => metric.type === 'direct' && metric.success);
    const hits = this.metrics.filter((metric) => metric.type === 'cache-hit');
    const sum = (items: RenderMetrics[]) =>
      items.reduce((total, metric) => total + metric.duration, 0);
    const average = (items: RenderMetrics[]) => (items.length ? sum(items) / items.length : 0);
    const count = this.metrics.length;
    const hitRate = (hits.length / count) * 100;
    const workerTime = average(workers),
      directTime = average(direct),
      hitTime = average(hits);
    const savings = count * directTime - (sum(workers) + sum(direct) + sum(hits));
    const recommendation =
      hitRate > 70 && workerTime < 2 * directTime
        ? '✅ Worker + Cache is highly beneficial'
        : hitRate > 50
          ? '✅ Worker + Cache is beneficial'
          : workerTime > 3 * directTime
            ? '⚠️ Worker overhead too high, consider direct rendering'
            : directTime < 5
              ? '⚠️ Formulas too simple, Worker overhead may not be worth it'
              : '✅ Worker prevents main thread blocking';
    return {
      totalRenders: count,
      cacheHits: hits.length,
      cacheHitRate: hitRate.toFixed(1),
      workerCalls: workers.length,
      directCalls: direct.length,
      averageWorkerTime: workerTime.toFixed(2),
      averageDirectTime: directTime.toFixed(2),
      averageCacheHitTime: hitTime.toFixed(3),
      workerSavings: savings.toFixed(2),
      recommendation,
    };
  }
  printReport() {
    const stats = this.getStats();
    console.group('📊 KaTeX Rendering Performance Report');
    console.groupEnd();
    return stats;
  }
  reset() {
    this.metrics = [];
  }
  exportMetrics() {
    return { metrics: [...this.metrics], stats: this.getStats(), timestamp: Date.now() };
  }
}

export const perfMonitor = new PerformanceMonitor();
export function enablePerfMonitoring() {
  perfMonitor.enable();
}
export function disablePerfMonitoring() {
  perfMonitor.disable();
}
export function getPerfReport() {
  return perfMonitor.printReport();
}
