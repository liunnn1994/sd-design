import type { ReactNode } from 'react';

import { runCssTransition } from '@sdata/web-core/transition/css';
import { createTreeExpandTransition } from '@sdata/web-core/tree/expand-transition';
import { useLayoutEffect, useRef } from 'react';

export function TreeTransitionList({
  expanded,
  empty,
  onEnd,
  className,
  children,
}: {
  expanded: boolean;
  empty: boolean;
  onEnd(): void;
  className: string;
  children: ReactNode;
}) {
  const element = useRef<HTMLDivElement>(null);
  const live = useRef(onEnd);
  live.current = onEnd;
  useLayoutEffect(() => {
    if (empty || !element.current) {
      live.current();
      return;
    }
    const target = element.current;
    const transition = createTreeExpandTransition({ expanded }, () => live.current());
    transition.onEnter(target);
    return runCssTransition(target, {
      name: 'v',
      enter: true,
      finish: () => transition.onAfterEnter(target),
    });
  }, [expanded, empty]);
  return empty ? null : (
    <div ref={element} className={className}>
      {children}
    </div>
  );
}
