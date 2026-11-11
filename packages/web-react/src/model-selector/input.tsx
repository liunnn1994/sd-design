import { createModelSelectorInputFoundation } from '@sdata/web-core/model-selector/input';
import { useLayoutEffect, useRef, useState } from 'react';

import { usePrefix } from '../config-provider/index.js';
import { IconSearch } from '../icon/icon-search.js';
import { Input, type InputProps } from '../input/index.js';
import { useModelSelectorContext } from './context.js';

export interface ModelSelectorInputProps extends InputProps {
  modelValue?: string;
}
export function ModelSelectorInput({
  value,
  modelValue,
  onValueChange,
  inputAttrs,
  className,
  ...attrs
}: ModelSelectorInputProps) {
  const context = useModelSelectorContext('ModelSelectorInput');
  const prefix = usePrefix('model-selector-input');
  const current = useRef({ context, value: value ?? modelValue, inputAttrs, onValueChange });
  current.current = { context, value: value ?? modelValue, inputAttrs, onValueChange };
  const [foundation] = useState(() =>
    createModelSelectorInputFoundation(
      {
        get modelValue() {
          return current.current.value ?? undefined;
        },
        get query() {
          return current.current.context.query;
        },
        set query(next) {
          current.current.context.setQuery(next);
        },
        get inputAttrs() {
          return current.current.inputAttrs;
        },
        get listId() {
          return current.current.context.listId;
        },
        get visible() {
          return current.current.context.visible;
        },
        get activeDescendant() {
          return current.current.context.foundation.getActiveDescendant();
        },
      },
      {
        update: (next) => current.current.onValueChange?.(next),
        moveActive: (offset) => current.current.context.foundation.moveActive(offset),
        selectActive: (event) => current.current.context.foundation.selectActive(event),
        setVisible: (next) => current.current.context.foundation.setVisible(next),
      },
    ),
  );
  useLayoutEffect(() => {
    foundation.syncModelValue(value ?? modelValue ?? undefined);
  }, [foundation, value, modelValue]);
  return (
    <div className={`${prefix}-container`}>
      <Input
        {...attrs}
        value={foundation.getMergedValue()}
        className={[prefix, className].filter(Boolean).join(' ')}
        inputAttrs={{
          ...foundation.getInputAttrs(),
          onKeyDown(event) {
            inputAttrs?.onKeyDown?.(event);
            attrs.onKeyDown?.(event.nativeEvent);
            foundation.handleKeydown(event.nativeEvent);
            if (event.nativeEvent.cancelBubble) event.stopPropagation();
          },
        }}
        prefix={<IconSearch />}
        onValueChange={foundation.handleInput}
      />
    </div>
  );
}
