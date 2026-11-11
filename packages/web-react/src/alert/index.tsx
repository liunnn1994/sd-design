import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { createAlertFoundation } from '@sdata/web-core/alert/foundation';
import { runCssTransition } from '@sdata/web-core/transition/css';
import { useLayoutEffect, useRef, useState } from 'react';

import { StatusIcon } from '../_shared/status-icon.js';
import { usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';

export interface AlertProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'onClose'> {
  type?: 'info' | 'success' | 'warning' | 'error' | 'normal';
  showIcon?: boolean;
  closable?: boolean;
  title?: ReactNode;
  banner?: boolean;
  center?: boolean;
  icon?: ReactNode;
  action?: ReactNode;
  closeElement?: ReactNode;
  onClose?: (event: Event) => void;
  onAfterClose?: () => void;
}

export function Alert({
  type = 'info',
  showIcon = true,
  closable = false,
  title,
  banner = false,
  center = false,
  icon,
  action,
  closeElement,
  onClose,
  onAfterClose,
  children,
  className,
  ref,
  ...attrs
}: AlertProps) {
  const prefix = usePrefix('alert');
  const iconPrefix = usePrefix('icon');
  const hoverPrefix = usePrefix('icon-hover');
  const { t } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const visibleRef = useRef(true);
  const [present, setPresent] = useState(true);
  const callbacks = useRef({ onClose, onAfterClose });
  callbacks.current = { onClose, onAfterClose };
  const [foundation] = useState(() =>
    createAlertFoundation(
      {
        get visible() {
          return visibleRef.current;
        },
        set visible(value: boolean) {
          visibleRef.current = value;
          setVisible(value);
        },
      },
      (event) => callbacks.current.onClose?.(event),
      () => callbacks.current.onAfterClose?.(),
    ),
  );
  useLayoutEffect(() => {
    if (visible || !root.current) return;
    return runCssTransition(root.current, {
      name: 'zoom-in-top',
      enter: false,
      finish: () => setPresent(false),
    });
  }, [visible]);
  useLayoutEffect(() => {
    if (!present) foundation.handleAfterLeave();
  }, [present, foundation]);
  if (!present) return null;
  return (
    <div
      {...attrs}
      ref={(element) => {
        root.current = element;
        if (typeof ref === 'function') return ref(element);
        if (ref) ref.current = element;
      }}
      role="alert"
      className={[
        prefix,
        `${prefix}-${type}`,
        banner && `${prefix}-banner`,
        center && `${prefix}-center`,
        Boolean(title) && `${prefix}-with-title`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showIcon && (type !== 'normal' || icon !== undefined) && (
        <div aria-hidden="true" className={`${prefix}-icon`}>
          {icon === undefined ? type !== 'normal' && <StatusIcon type={type} /> : icon}
        </div>
      )}
      <div className={`${prefix}-body`}>
        {Boolean(title) && <div className={`${prefix}-title`}>{title}</div>}
        <div className={`${prefix}-content`}>{children}</div>
      </div>
      {action != null && <div className={`${prefix}-action`}>{action}</div>}
      {closable && (
        <div
          tabIndex={0}
          role="button"
          aria-label={t('a11y.close')}
          className={`${prefix}-close-btn`}
          onClick={(event) => foundation.handleClose(event.nativeEvent)}
          onKeyDown={(event) => foundation.onCloseKeydown(event.nativeEvent)}
        >
          {closeElement === undefined ? (
            <span className={hoverPrefix}>
              <svg
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth={4}
                viewBox="0 0 48 48"
                className={`${iconPrefix} ${iconPrefix}-close`}
              >
                <path d="M9.857 9.858 24 24m0 0 14.142 14.142M24 24 38.142 9.858M24 24 9.857 38.142" />
              </svg>
            </span>
          ) : (
            closeElement
          )}
        </div>
      )}
    </div>
  );
}

export default Alert;

export type AlertInstance = ReactComponentRef<typeof Alert>;
