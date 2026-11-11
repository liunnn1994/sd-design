import { createSenderHeader } from '@sdata/web-core/sender/controls';
import { runCssTransition } from '@sdata/web-core/transition/css';
import {
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

import type { SenderHeaderProps } from './types.js';

import { Button } from '../button/index.js';
import { usePrefix } from '../config-provider/index.js';
import IconClose from '../icon/icon-close.js';
import { useI18n } from '../locale/index.js';
import { SenderContext } from './context.js';

export function SenderHeader(props: SenderHeaderProps) {
  const {
    open = false,
    forceRender = false,
    title,
    closable = true,
    classNames = {},
    styles = {},
    slots,
    onOpenChange: _change,
    children,
    className,
    style,
    ref,
    ...attrs
  } = props;
  const context = useContext(SenderContext),
    ownPrefix = usePrefix('sender'),
    prefix = context?.prefix ?? ownPrefix,
    cls = `${prefix}-header`;
  const { t } = useI18n();
  const root = useRef<HTMLDivElement>(null),
    current = useRef(props);
  current.current = props;
  const rendered = useRef(open || forceRender),
    previous = useRef(open);
  const [hidden, setHidden] = useState(!open);
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  const [foundation] = useState(() =>
    createSenderHeader(
      {
        get props() {
          return {
            open: current.current.open ?? false,
            forceRender: current.current.forceRender ?? false,
          };
        },
        get rendered() {
          return rendered.current;
        },
        set rendered(value) {
          if (rendered.current !== value) {
            rendered.current = value;
            refresh();
          }
        },
      },
      { update: () => undefined, change: (value) => current.current.onOpenChange?.(value) },
    ),
  );
  const present = open || forceRender || rendered.current;
  useImperativeHandle(ref, () => root.current!, [present]);
  useLayoutEffect(() => {
    foundation.syncRendered(open, forceRender);
    if (!root.current || previous.current === open) return;
    previous.current = open;
    const element = root.current;
    if (open) {
      setHidden(false);
      foundation.beforeEnter(element);
      foundation.enter(element);
    } else {
      foundation.beforeLeave(element);
      foundation.leave(element);
    }
    const cancel = runCssTransition(element, {
      name: `${cls}-motion`,
      enter: open,
      finish() {
        if (open) foundation.afterEnter(element);
        else {
          foundation.afterLeave();
          setHidden(true);
        }
      },
    });
    return () => {
      cancel();
      foundation.cancelFrame();
      if (!open) foundation.afterEnter(element);
    };
  }, [foundation, open, forceRender, cls]);
  useLayoutEffect(() => () => foundation.cancelFrame(), [foundation]);
  if (!present) return null;
  return (
    <div
      {...attrs}
      ref={root}
      className={[prefix, cls, className].filter(Boolean).join(' ')}
      style={{ ...style, display: hidden ? 'none' : style?.display }}
    >
      {(closable || title !== undefined || slots?.title) && (
        <div
          className={[`${cls}-header`, classNames.header].filter(Boolean).join(' ')}
          style={styles.header}
        >
          <div className={`${cls}-title`}>{slots?.title ? slots.title() : title}</div>
          {closable && (
            <div className={`${cls}-close`}>
              <Button
                type="text"
                size="small"
                aria-label={t('sender.closeHeader')}
                onClick={foundation.close}
                icon={<IconClose />}
              />
            </div>
          )}
        </div>
      )}
      {children !== undefined && (
        <div
          className={[`${cls}-content`, classNames.content].filter(Boolean).join(' ')}
          style={styles.content}
        >
          {children}
        </div>
      )}
    </div>
  );
}
