import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef } from 'react';

import { createBackTop } from '@sdata/web-core/back-top/foundation';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { useTransitionPresence } from '../_shared/use-transition-presence.js';
import { usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';

export interface BackTopProps extends ComponentPropsWithRef<'div'> {
  visibleHeight?: number;
  targetContainer?: string | HTMLElement;
  easing?: string;
  duration?: number;
}

export function BackTop({
  visibleHeight = 200,
  targetContainer,
  easing = 'quartOut',
  duration = 200,
  children,
  className,
  onClick,
  ref,
  ...attrs
}: BackTopProps) {
  const prefix = usePrefix('back-top');
  const iconPrefix = usePrefix('icon');
  const { t } = useI18n();
  const live = useRef({ visibleHeight, targetContainer, easing, duration });
  live.current = { visibleHeight, targetContainer, easing, duration };
  const target = useRef<HTMLElement>(undefined);
  const [visible, setVisible] = useState(false);
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const rootRef = useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      if (typeof ref === 'function') return ref(node);
      if (ref) ref.current = node;
    },
    [ref],
  );
  const [foundation] = useState(() =>
    createBackTop({
      get props() {
        return live.current;
      },
      get target() {
        return target.current;
      },
      set target(value) {
        target.current = value;
      },
      setVisible,
    }),
  );
  useLayoutEffect(() => {
    const cleanup = foundation.connect();
    return () => {
      cleanup?.();
      foundation.dispose();
    };
  }, [foundation, targetContainer]);
  useLayoutEffect(() => {
    foundation.scroll();
  }, [foundation, visibleHeight]);
  const presence = useTransitionPresence(
    visible,
    element,
    'fade-in',
    undefined,
    () => {},
    () => {},
  );
  if (!presence.present) return null;
  return (
    <div
      {...attrs}
      className={[prefix, className].filter(Boolean).join(' ')}
      ref={rootRef}
      onClick={(event) => {
        foundation.toTop();
        onClick?.(event);
      }}
    >
      {children === undefined ? (
        <button type="button" className={`${prefix}-btn`} aria-label={t('a11y.backToTop')}>
          <svg
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            viewBox="0 0 48 48"
            className={`${iconPrefix} ${iconPrefix}-to-top`}
          >
            <path d="M43 7H5M24 20v23M24 13.96 30.453 21H17.546zm.736-.804" />
            <path fill="currentColor" stroke="none" d="m24 14-6 7h12z" />
          </svg>
        </button>
      ) : (
        children
      )}
    </div>
  );
}

export default BackTop;

export type BackTopInstance = ReactComponentRef<typeof BackTop>;
