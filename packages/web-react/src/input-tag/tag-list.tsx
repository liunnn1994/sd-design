import type { ReactElement, ReactNode } from 'react';

import { runCssTransition } from '@sdata/web-core/transition/css';
import { cloneElement, useLayoutEffect, useRef, useState } from 'react';

import type { TagProps } from '../tag/index.js';

interface Entry {
  key: string;
  node: ReactElement<TagProps>;
}

/** Retain removed tags until their shared CSS leave transition finishes. */
export function TagList({
  items,
  className,
  children,
}: {
  items: Entry[];
  className: string;
  children: ReactNode;
}) {
  const [previous, setPrevious] = useState(items);
  const [rendered, setRendered] = useState(items);
  if (previous !== items) {
    setPrevious(items);
    const next = [...items];
    rendered.forEach((item, index) => {
      if (!items.some((entry) => entry.key === item.key))
        next.splice(Math.min(index, next.length), 0, item);
    });
    setRendered(next);
  }
  const root = useRef<HTMLSpanElement>(null);
  const latest = useRef(items);
  latest.current = items;
  const initial = useRef(new Set(items.map((item) => item.key)));
  const transitions = useRef(new Map<string, { visible: boolean; cancel(): void }>());
  const positions = useRef(new Map<string, { left: number; top: number }>());
  const moves = useRef<Animation[]>([]);
  useLayoutEffect(() => {
    moves.current.forEach((animation) => animation.cancel());
    moves.current = [];
    const nextPositions = new Map<string, { left: number; top: number }>();
    for (const element of root.current?.children ?? []) {
      if (!(element instanceof HTMLElement) || !element.dataset.inputTagKey) continue;
      const key = element.dataset.inputTagKey;
      const visible = items.some((item) => item.key === key);
      const old = transitions.current.get(key);
      if (!old || old.visible !== visible) {
        old?.cancel();
        const state = { visible, cancel() {} };
        transitions.current.set(key, state);
        if (!initial.current.has(key) || !visible || old) {
          state.cancel = runCssTransition(element, {
            name: 'input-tag-zoom',
            enter: visible,
            finish() {
              if (!visible && !latest.current.some((item) => item.key === key)) {
                transitions.current.delete(key);
                initial.current.delete(key);
                setRendered((entries) => entries.filter((item) => item.key !== key));
              }
            },
          });
        }
      }
      if (!visible) continue;
      const position = { left: element.offsetLeft, top: element.offsetTop };
      const before = positions.current.get(key);
      nextPositions.set(key, position);
      if (
        old?.visible &&
        before &&
        (before.left !== position.left || before.top !== position.top)
      ) {
        element.classList.add('input-tag-zoom-move');
        const style = getComputedStyle(element);
        const duration =
          Number.parseFloat(style.transitionDuration) *
          (style.transitionDuration.endsWith('ms') ? 1 : 1000);
        const easing = style.transitionTimingFunction;
        element.classList.remove('input-tag-zoom-move');
        if (duration > 0)
          moves.current.push(
            element.animate(
              [
                {
                  transform: `translate(${before.left - position.left}px, ${before.top - position.top}px)`,
                },
                { transform: 'translate(0, 0)' },
              ],
              { duration, easing },
            ),
          );
      }
    }
    positions.current = nextPositions;
  }, [items, rendered]);
  useLayoutEffect(
    () => () => {
      transitions.current.forEach((state) => state.cancel());
      transitions.current.clear();
      moves.current.forEach((animation) => animation.cancel());
    },
    [],
  );
  return (
    <span ref={root} className={className}>
      {rendered.map((item) =>
        cloneElement(item.node, { key: item.key, ...{ 'data-input-tag-key': item.key } }),
      )}
      {children}
    </span>
  );
}
