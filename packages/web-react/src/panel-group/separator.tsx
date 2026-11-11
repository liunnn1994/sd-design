import { edgeSize } from '@sdata/web-core/panel-group/env';
import { attachSeparator } from '@sdata/web-core/panel-group/separator';
import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';

import type { PanelSeparatorProps } from './types.js';

import { usePrefix } from '../config-provider/index.js';
import IconDragDotVertical from '../icon/icon-drag-dot-vertical.js';
import IconDragDot from '../icon/icon-drag-dot.js';
import { useI18n } from '../locale/index.js';
import { usePanelGroup } from './context.js';

const subscribeEmpty = () => () => {};
export function PanelSeparator({
  own,
  ariaLabel,
  children,
  className,
  style,
  ref,
  ...attrs
}: PanelSeparatorProps) {
  const group = usePanelGroup();
  const { axes, disabled } = group;
  const end = useSyncExternalStore(
    own?.subscribe ?? subscribeEmpty,
    () => own?.state.end ?? false,
    () => false,
  );
  const grip = useRef<HTMLDivElement>(null);
  const prefix = usePrefix('panel-separator');
  const trigger = usePrefix('resizebox-trigger');
  const { t } = useI18n();
  useLayoutEffect(() => {
    if (grip.current && !disabled) return attachSeparator(grip.current, group, own);
  }, [group, own, disabled]);
  const anchor =
    axes.axis === 'Inline'
      ? end
        ? 'insetInlineEnd'
        : 'insetInlineStart'
      : end
        ? 'insetBlockEnd'
        : 'insetBlockStart';
  const GripIcon = axes.separator === 'horizontal' ? IconDragDot : IconDragDotVertical;
  return (
    <div
      className={own ? `${prefix}-edge` : prefix}
      data-sd-panels-separator={own ? undefined : ''}
      style={{
        ...(own
          ? ({
              position: 'absolute',
              [anchor]: 0,
              [axes.axis === 'Inline' ? 'insetBlock' : 'insetInline']: 0,
            } as const)
          : { [axes.extent]: 0 }),
        display: disabled ? 'none' : undefined,
      }}
    >
      <div
        {...attrs}
        ref={(node) => {
          grip.current = node;
          if (typeof ref === 'function') return ref(node);
          if (ref) ref.current = node;
        }}
        className={[`${prefix}-grip`, trigger, `${trigger}-${axes.separator}`, className]
          .filter(Boolean)
          .join(' ')}
        style={{
          cursor: axes.cursor,
          ...(own ? { [axes.extent]: `${edgeSize()}px` } : {}),
          ...style,
        }}
        role="separator"
        tabIndex={0}
        aria-orientation={axes.separator}
        aria-label={ariaLabel ?? attrs['aria-label'] ?? t('a11y.resize')}
      >
        {children ?? (
          <div className={`${trigger}-icon-wrapper`} aria-hidden="true">
            <GripIcon className={`${trigger}-icon`} />
          </div>
        )}
      </div>
    </div>
  );
}
