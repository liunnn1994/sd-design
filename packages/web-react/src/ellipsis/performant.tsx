import type { ReactElement, Ref } from 'react';

import { createPerformantEllipsisFoundation } from '@sdata/web-core/ellipsis/performant';
import { useImperativeHandle, useRef, useState } from 'react';

import type { EllipsisProps, EllipsisExposed } from './index.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { EllipsisRenderer } from './index.js';

export interface PerformantEllipsisExposed {
  setFocused(focused: boolean): Promise<void>;
}
export type PerformantEllipsisInstance = PerformantEllipsisExposed;
export interface PerformantEllipsisProps extends Omit<EllipsisProps, 'ref'> {
  ref?: Ref<PerformantEllipsisExposed>;
}

export function PerformantEllipsis({ ref, ...props }: PerformantEllipsisProps): ReactElement {
  const [activated, setActivated] = useState(false);
  const live = useRef({ activated, expandTrigger: props.expandTrigger });
  live.current = { activated, expandTrigger: props.expandTrigger };
  const active = useRef<EllipsisExposed>(null);
  const afterRender = useAfterRender();

  const [foundation] = useState(() =>
    createPerformantEllipsisFoundation({
      get activated() {
        return live.current.activated;
      },
      set activated(next) {
        live.current.activated = next;
        setActivated(next);
      },
      get expandTrigger() {
        return live.current.expandTrigger;
      },
      get triggerElement() {
        return active.current?.triggerElement;
      },
      afterRender,
      waitForMeasurement: () => active.current?.waitForMeasurement(),
      toggleExpanded: () => active.current?.toggleExpanded(),
      replayHover: (element) =>
        element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })),
      dispatchFocus: (element, focused) =>
        element.dispatchEvent(new FocusEvent(focused ? 'focusin' : 'focusout', { bubbles: true })),
    }),
  );
  useImperativeHandle(ref, () => ({ setFocused: foundation.setFocused }), [foundation]);
  return (
    <EllipsisRenderer
      {...props}
      active={activated}
      ref={active}
      onMouseEnter={(event) => {
        props.onMouseEnter?.(event);
        if (!activated) foundation.handleMouseenter();
      }}
      onFocus={(event) => {
        props.onFocus?.(event);
        if (!activated) foundation.handleFocus();
      }}
      onClick={(event) => {
        props.onClick?.(event);
        if (!activated) foundation.handleClick(event);
      }}
    />
  );
}
