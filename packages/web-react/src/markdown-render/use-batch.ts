import type { MarkdownBatchConfig } from '@sdata/web-core/markdown/batch-scheduler';

import { createMarkdownBatchScheduler } from '@sdata/web-core/markdown/batch-scheduler';
import { useLayoutEffect, useRef, useState } from 'react';

export function useMarkdownBatch(options: MarkdownBatchConfig, afterRender: () => Promise<void>) {
  const live = useRef(options);
  live.current = options;
  const [state, setState] = useState({ count: options.initial, config: options });
  const [scheduler] = useState(() =>
    createMarkdownBatchScheduler({
      config: () => live.current,
      publish: (count) => setState({ count, config: live.current }),
      afterRender,
    }),
  );
  useLayoutEffect(() => {
    scheduler.update();
  }, [
    scheduler,
    options.enabled,
    options.count,
    options.datasetKey,
    options.initial,
    options.size,
    options.delay,
    options.budget,
    options.idleTimeout,
  ]);
  useLayoutEffect(() => () => scheduler.cancel(), [scheduler]);
  const previous = state.config;
  const reset =
    !Object.is(previous.datasetKey, options.datasetKey) ||
    previous.enabled !== options.enabled ||
    previous.size !== options.size ||
    previous.initial !== options.initial ||
    previous.delay !== options.delay ||
    previous.count === 0;
  return {
    count: Math.min(options.count, reset ? options.initial : state.count),
    flush: scheduler.flush,
  };
}
