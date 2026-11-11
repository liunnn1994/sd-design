import { createMarkdownViewportScheduler } from '@sdata/web-core/markdown/viewport';
import { useLayoutEffect, useRef, useState } from 'react';

export function useMarkdownViewport(options: {
  enabled: boolean;
  sessionKey: string;
  count: number;
  initial: number;
  rootMargin?: string;
  maxTargets?: number;
}) {
  const { enabled, sessionKey, count, initial } = options;
  const elements = useRef(new Map<number, HTMLElement>());
  const [state, setState] = useState({ sessionKey, active: new Set<number>(), disabled: false });
  const current = state.sessionKey === sessionKey ? state : undefined;
  const active = useRef(current?.active);
  active.current = current?.active;
  const defer = enabled && !current?.disabled;
  const margin = options.rootMargin?.trim() || '400px';
  const requestedLimit = Number(options.maxTargets);
  const limit =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.max(1, Math.trunc(requestedLimit))
      : 640;
  useLayoutEffect(() => {
    if (!defer) return;
    const pending = [...elements.current].filter(
      ([index]) => index >= initial && index < count && !active.current?.has(index),
    );
    if (pending.length > limit) {
      setState({ sessionKey, active: new Set(), disabled: true });
      return;
    }
    const scheduler = createMarkdownViewportScheduler(margin);
    for (const [index, element] of pending)
      scheduler.watch(element, () => {
        setState((previous) => ({
          sessionKey,
          disabled: false,
          active: new Set(previous.sessionKey === sessionKey ? previous.active : []).add(index),
        }));
      });
    return () => scheduler.dispose();
  }, [defer, sessionKey, count, initial, margin, limit]);
  return {
    elements: elements.current,
    revision: state,
    shouldRender: (index: number) =>
      !defer || index < initial || Boolean(current?.active.has(index)),
  };
}
