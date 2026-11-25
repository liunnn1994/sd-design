import type { CascaderModelValue, CascaderOptionInfo } from '@sdata/web-core/cascader/types';

import { createCascaderFoundation } from '@sdata/web-core/cascader/foundation';
import { getCascaderValueMap, getDefaultCascaderValue } from '@sdata/web-core/cascader/values';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

export interface CascaderSelectionProps {
  value?: CascaderModelValue;
  defaultValue?: CascaderModelValue;
  multiple?: boolean | undefined;
  pathMode?: boolean | undefined;
  checkStrictly?: boolean | undefined;
  readonly?: boolean | undefined;
  valueKey?: string | undefined;
  onValueChange?: ((value: CascaderModelValue) => void) | undefined;
  onChange?: ((value: CascaderModelValue) => void) | undefined;
}
export function useCascaderSelection<P>(
  props: CascaderSelectionProps,
  view: {
    leafOptionMap: Map<string, CascaderOptionInfo<P>>;
    leafOptionValueMap: Map<string | number, string>;
    setSelectedPath(key?: string): void;
    setActiveKey(key?: string): void;
    onReadonly?(): void;
    onFormChange?(): void;
    afterSingleSelect?(): void;
    afterMultipleSelect?(): void;
  },
) {
  const current = useRef({ props, view });
  current.current = { props, view };
  const internal = useRef(
    props.defaultValue ?? getDefaultCascaderValue(!!props.multiple, !!props.pathMode),
  );
  const [, render] = useReducer((version: number) => version + 1, 0);
  const getValue = () => current.current.props.value ?? internal.current;
  const getValueMap = () =>
    getCascaderValueMap(getValue(), {
      multiple: !!current.current.props.multiple,
      pathMode: !!current.current.props.pathMode,
      valueKey: current.current.props.valueKey ?? 'value',
      leafOptionValueMap: current.current.view.leafOptionValueMap,
    });
  const [foundation] = useState(() =>
    createCascaderFoundation<P>({
      getMultiple: () => !!current.current.props.multiple,
      getPathMode: () => !!current.current.props.pathMode,
      getCheckStrictly: () => !!current.current.props.checkStrictly,
      getReadonly: () => !!current.current.props.readonly,
      getValueMap,
      getLeafOptions: () => current.current.view.leafOptionMap,
      setValue: (value) => {
        internal.current = value;
        render();
      },
      setSelectedPath: (key) => current.current.view.setSelectedPath(key),
      setActiveKey: (key) => current.current.view.setActiveKey(key),
      onReadonly: () => current.current.view.onReadonly?.(),
      onFormChange: () => current.current.view.onFormChange?.(),
      afterSingleSelect: () => current.current.view.afterSingleSelect?.(),
      afterMultipleSelect: () => current.current.view.afterMultipleSelect?.(),
      updateValue: (value) => current.current.props.onValueChange?.(value),
      change: (value) => current.current.props.onChange?.(value),
    }),
  );
  const previous = useRef({
    value: props.value,
    multiple: !!props.multiple,
    pathMode: !!props.pathMode,
  });
  useLayoutEffect(() => {
    if (!Object.is(previous.current.value, props.value) && props.value == null) {
      internal.current = getDefaultCascaderValue(!!props.multiple, !!props.pathMode);
      render();
    }
    const modeChanged =
      previous.current.multiple !== !!props.multiple ||
      previous.current.pathMode !== !!props.pathMode;
    previous.current = {
      value: props.value,
      multiple: !!props.multiple,
      pathMode: !!props.pathMode,
    };
    if (modeChanged) foundation.modeChanged();
  }, [foundation, props.value, props.multiple, props.pathMode]);
  return { value: getValue(), valueMap: getValueMap(), foundation };
}
