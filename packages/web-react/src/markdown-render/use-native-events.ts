import type { FragmentInstance } from 'react';

import { useCallback, useLayoutEffect, useRef } from 'react';

import type { MarkdownNodeEvents } from './nodes/events.js';

import { getMarkdownReferenceId } from './nodes/events.js';

// React 19.3 Fragment listeners delegate without adding a host element.
export function useMarkdownNativeEvents(events: MarkdownNodeEvents, fragment: boolean) {
  const latest = useRef({ events, fragment });
  latest.current = { events, fragment };
  const current = useRef<HTMLElement | FragmentInstance | null>(null);
  const cleanup = useRef<(() => void) | undefined>(undefined);
  const listen = useCallback((instance: HTMLElement | FragmentInstance | null) => {
    cleanup.current?.();
    cleanup.current = undefined;
    if (!instance) return;
    const click: EventListener = (event) => {
      if (event.currentTarget instanceof Element)
        latest.current.events.onClick?.(
          event as MouseEvent,
          getMarkdownReferenceId(event, event.currentTarget),
        );
    };
    const forward =
      (kind: 'onMouseOver' | 'onMouseOut'): EventListener =>
      (event) => {
        if (
          latest.current.fragment ||
          (event.target instanceof Element && event.target.closest('[data-node-index]'))
        )
          latest.current.events[kind]?.(event as MouseEvent);
      };
    const over = forward('onMouseOver'),
      out = forward('onMouseOut');
    instance.addEventListener('click', click);
    instance.addEventListener('mouseover', over);
    instance.addEventListener('mouseout', out);
    cleanup.current = () => {
      instance.removeEventListener('click', click);
      instance.removeEventListener('mouseover', over);
      instance.removeEventListener('mouseout', out);
    };
  }, []);
  const attach = useCallback(
    (instance: HTMLElement | FragmentInstance | null) => {
      current.current = instance;
      listen(instance);
    },
    [listen],
  );
  useLayoutEffect(() => {
    listen(current.current);
    return () => cleanup.current?.();
  }, [listen]);
  return attach;
}
