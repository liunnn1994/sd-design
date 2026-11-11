import type { ToolbarModelValue } from '@sdata/web-core/toolbar/types';

import { createToolbarFoundation, type ToolbarSchema } from '@sdata/web-core/toolbar/foundation';
import { useReducer, useRef, useState } from 'react';

export interface ToolbarStateOptions<Schema extends ToolbarSchema> {
  value?: ToolbarModelValue;
  defaultValue?: ToolbarModelValue;
  schemas?: readonly Schema[];
  resetSkipKeys?: string[];
  allowExpand?: boolean;
  defaultExpand?: boolean;
  itemHeight?: number;
  onValueChange?(value: ToolbarModelValue): void;
  onSearch?(value: ToolbarModelValue): void;
  onReset?(): void;
}

export function useToolbar<Schema extends ToolbarSchema>(
  props: ToolbarStateOptions<Schema>,
  clearValidate: () => void,
) {
  const current = useRef({ props, clearValidate });
  current.current = { props, clearValidate };
  const [, render] = useReducer((version: number) => version + 1, 0);
  const [state] = useState(() => ({
    value: props.defaultValue ?? {},
    expanded: props.defaultExpand ?? false,
    overflow: false,
    bodyHeight: 0,
  }));
  const setValue = (value: ToolbarModelValue) => {
    if (current.current.props.value === undefined) {
      state.value = value;
      render();
    }
    current.current.props.onValueChange?.(value);
  };
  const [foundation] = useState(() =>
    createToolbarFoundation<Schema>(
      {
        props: {
          get schemas() {
            return current.current.props.schemas ?? [];
          },
          get resetSkipKeys() {
            return current.current.props.resetSkipKeys ?? [];
          },
          get allowExpand() {
            return current.current.props.allowExpand ?? false;
          },
          get itemHeight() {
            return current.current.props.itemHeight ?? 32;
          },
        },
        get modelValue() {
          return current.current.props.value ?? state.value;
        },
        set modelValue(value) {
          setValue(value);
        },
        get isExpand() {
          return state.expanded;
        },
        set isExpand(value) {
          if (state.expanded !== value) {
            state.expanded = value;
            render();
          }
        },
        get isOverflow() {
          return state.overflow;
        },
        set isOverflow(value) {
          if (state.overflow !== value) {
            state.overflow = value;
            render();
          }
        },
        get bodyHeight() {
          return state.bodyHeight;
        },
        set bodyHeight(value) {
          if (state.bodyHeight !== value) {
            state.bodyHeight = value;
            render();
          }
        },
      },
      {
        search: (value) => current.current.props.onSearch?.(value),
        reset: () => current.current.props.onReset?.(),
        clearValidate: () => current.current.clearValidate(),
      },
    ),
  );
  return {
    foundation,
    setValue,
    value: props.value ?? state.value,
    expanded: state.expanded,
    overflow: state.overflow,
    bodyMaxHeight: foundation.getBodyMaxHeight(),
    schemas: foundation.getResolvedSchemas(),
    schemaSlotNames: foundation.getSchemaSlotNames(),
  };
}
