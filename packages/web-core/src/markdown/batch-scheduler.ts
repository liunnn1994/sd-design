export interface MarkdownBatchConfig {
  enabled: boolean;
  count: number;
  datasetKey: unknown;
  initial: number;
  size: number;
  delay: number;
  budget: number;
  idleTimeout: number;
}

export function getMarkdownAdaptiveBatchSize(
  current: number,
  maximum: number,
  elapsed: number,
  budget: number,
) {
  const target = Math.max(2, budget);
  const size = Math.max(1, maximum || 1);
  if (elapsed > 1.5 * target)
    return Math.max(Math.max(1, Math.floor(size / 4)), Math.floor(0.8 * current));
  if (elapsed < 0.6 * target && current < size) return Math.min(size, Math.ceil(1.2 * current));
  return current;
}

export function createMarkdownBatchScheduler(port: {
  config(): MarkdownBatchConfig;
  publish(count: number): void;
  afterRender(): Promise<void>;
}) {
  let previous: MarkdownBatchConfig | undefined;
  let count = 0;
  let adaptive = 1;
  let generation = 0;
  let busy = false;
  let cancelScheduled: (() => void) | undefined;
  let cancelMeasurement: (() => void) | undefined;
  function cancel() {
    generation++;
    cancelScheduled?.();
    cancelMeasurement?.();
    cancelScheduled = undefined;
    cancelMeasurement = undefined;
    busy = false;
  }
  function publish(value: number) {
    count = value;
    port.publish(value);
  }
  function schedule(step = adaptive) {
    const options = port.config();
    if (!options.enabled || count >= options.count || busy || cancelScheduled) return;
    const token = generation;
    const view = window;
    const run = () => {
      if (token !== generation) return;
      cancelScheduled = undefined;
      busy = true;
      const started = performance.now();
      publish(Math.min(port.config().count, count + Math.max(1, step)));
      void port.afterRender().then(() => {
        if (token !== generation) return;
        const elapsed = performance.now() - started;
        const complete = () => {
          if (token !== generation || !busy) return;
          cancelMeasurement?.();
          cancelMeasurement = undefined;
          busy = false;
          const current = port.config();
          adaptive = getMarkdownAdaptiveBatchSize(adaptive, current.size, elapsed, current.budget);
          schedule();
        };
        const frame =
          typeof view.requestAnimationFrame === 'function'
            ? view.requestAnimationFrame(complete)
            : undefined;
        const timer = view.setTimeout(
          complete,
          frame == null ? 0 : Math.max(32, port.config().idleTimeout),
        );
        cancelMeasurement = () => {
          if (frame != null) view.cancelAnimationFrame(frame);
          view.clearTimeout(timer);
        };
      });
    };
    if (
      view.document.visibilityState !== 'hidden' &&
      typeof view.requestIdleCallback === 'function'
    ) {
      const idle = view.requestIdleCallback(run, { timeout: Math.max(0, options.idleTimeout) });
      cancelScheduled = () => view.cancelIdleCallback(idle);
    } else if (
      view.document.visibilityState !== 'hidden' &&
      typeof view.requestAnimationFrame === 'function'
    ) {
      const frame = view.requestAnimationFrame(() => {
        if (token !== generation) return;
        if (options.delay === 0) run();
        else {
          const timer = view.setTimeout(run, Math.max(0, options.delay));
          cancelScheduled = () => view.clearTimeout(timer);
        }
      });
      cancelScheduled = () => view.cancelAnimationFrame(frame);
    } else {
      const timer = view.setTimeout(run, Math.max(0, options.delay));
      cancelScheduled = () => view.clearTimeout(timer);
    }
  }
  return {
    cancel,
    flush() {
      cancel();
      publish(port.config().count);
    },
    update() {
      const next = port.config();
      const old = previous;
      previous = { ...next };
      const keyChanged = !old || !Object.is(next.datasetKey, old.datasetKey);
      const totalChanged = !old || next.count !== old.count;
      const append = old && totalChanged && next.count > old.count && old.count > 0 && !keyChanged;
      const changedConfig =
        !old ||
        next.enabled !== old.enabled ||
        next.size !== old.size ||
        next.initial !== old.initial ||
        next.delay !== old.delay;
      if (keyChanged || totalChanged || changedConfig || !next.enabled) cancel();
      if (((keyChanged || totalChanged) && !append) || changedConfig)
        adaptive = Math.max(1, next.size || 1);
      if (!next.count || !next.enabled) {
        publish(next.count);
        return;
      }
      publish(
        keyChanged || !old?.count || changedConfig
          ? Math.min(next.count, next.initial)
          : Math.min(count, next.count),
      );
      schedule(Math.max(1, next.initial || next.size || next.count));
    },
  };
}
