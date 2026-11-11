import { createModelSelectorTriggerFoundation } from '@sdata/web-core/model-selector/trigger';
import { Fragment, cloneElement, isValidElement, type HTMLAttributes, type ReactNode } from 'react';

import type { ModelSelectorSlotProps } from './model-selector.js';

import { getRenderItems } from '../_shared/children.js';
import { Button } from '../button/index.js';
import { usePrefix } from '../config-provider/index.js';
import { useModelSelectorContext } from './context.js';

export interface ModelSelectorTriggerSlotProps extends ModelSelectorSlotProps {
  disabled: boolean;
}
export interface ModelSelectorTriggerProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  disabled?: boolean;
  children?: ReactNode | ((state: ModelSelectorTriggerSlotProps) => ReactNode);
}
export function ModelSelectorTrigger({
  disabled = false,
  children,
  className,
  onClick,
  ...attrs
}: ModelSelectorTriggerProps) {
  const context = useModelSelectorContext('ModelSelectorTrigger');
  const prefix = usePrefix('model-selector-trigger');
  const foundation = createModelSelectorTriggerFoundation(
    { disabled },
    { visible: { value: context.visible }, setVisible: context.foundation.setVisible },
  );
  const scope = {
    disabled,
    visible: context.visible,
    open: () => context.foundation.setVisible(true),
    close: () => context.foundation.setVisible(false),
  };
  const items = getRenderItems(typeof children === 'function' ? children(scope) : children);
  const target = items.findIndex(({ content }) => isValidElement(content));
  const original =
    target >= 0 && isValidElement<HTMLAttributes<HTMLElement>>(items[target].content)
      ? items[target].content.props
      : undefined;
  const forwarded: Record<string, unknown> = { ...attrs };
  for (const [name, handler] of Object.entries(attrs)) {
    const previous = original && (original as Record<string, unknown>)[name];
    if (
      /^on[A-Z]/.test(name) &&
      typeof previous === 'function' &&
      typeof handler === 'function' &&
      previous !== handler
    ) {
      forwarded[name] = (...args: unknown[]) => {
        previous(...args);
        handler(...args);
      };
    }
  }
  const merged = {
    ...forwarded,
    disabled,
    'aria-expanded': context.visible,
    'aria-disabled': disabled || undefined,
    'aria-haspopup': 'dialog' as const,
    'className': [original?.className, prefix, className].filter(Boolean).join(' '),
    'style': { ...original?.style, ...attrs.style },
    'onClick'(event: React.MouseEvent<HTMLElement>) {
      original?.onClick?.(event);
      if (onClick !== original?.onClick) onClick?.(event);
      foundation.handleClick(event.nativeEvent);
    },
  };
  if (target < 0) return <Button {...merged}>{items.map(({ content }) => content)}</Button>;
  return (
    <>
      {items.map(({ content, key }, index) =>
        index === target && isValidElement(content) ? (
          cloneElement(content, { ...merged, key })
        ) : (
          <Fragment key={key}>{content}</Fragment>
        ),
      )}
    </>
  );
}
