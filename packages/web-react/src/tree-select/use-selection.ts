import type { TreeSelectValue, FallbackOption } from '@sdata/web-core/tree-select/types';
import type { TreeModelNode, TreeFieldNames, TreeNodeKey } from '@sdata/web-core/tree/types';

import { createTreeSelectFoundation } from '@sdata/web-core/tree-select/foundation';
import { createTreeSelectValues, getKeys } from '@sdata/web-core/tree-select/values';
import { useReducer, useRef, useState } from 'react';

import type { TreeNodeData } from '../tree/node.js';

import { useAfterRender } from '../_shared/use-after-render.js';

export interface TreeSelectSelectionProps<T extends TreeNodeData> {
  value?: TreeSelectValue;
  defaultValue?: TreeSelectValue;
  multiple?: boolean;
  treeCheckable?: boolean;
  treeCheckStrictly?: boolean;
  labelInValue?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  showPath?: boolean;
  separator?: string;
  fieldNames?: TreeFieldNames;
  fallbackOption?: FallbackOption<T>;
  inputValue?: string;
  retainInputValue?: boolean;
  onValueChange?(value: TreeSelectValue | undefined): void;
  onChange?(value: TreeSelectValue | undefined): void;
  onClear?(): void;
}
export function useTreeSelectSelection<T extends TreeNodeData>(
  props: TreeSelectSelectionProps<T>,
  view: {
    nodes: Map<TreeNodeKey, TreeModelNode<T>>;
    setVisible(visible: boolean): void;
    setInputValue(value: string): void;
    onFormChange?(): void;
  },
) {
  const current = useRef({ props, view });
  current.current = { props, view };
  const afterRender = useAfterRender();
  const [, render] = useReducer((value: number) => value + 1, 0);
  const [values] = useState(() =>
    createTreeSelectValues<T, TreeModelNode<T>>({
      getNodes: () => current.current.view.nodes,
      getShowPath: () => current.current.props.showPath,
      getFieldNames: () => current.current.props.fieldNames,
      getSeparator: () => current.current.props.separator,
      getMultiple: () => current.current.props.multiple,
      getCheckable: () => current.current.props.treeCheckable,
      getFallbackOption: () => current.current.props.fallbackOption,
    }),
  );
  const local = useRef(getKeys(values.normalizeValue(props.value ?? props.defaultValue ?? [])));
  const previous = useRef(props.value);
  if (!Object.is(previous.current, props.value)) {
    local.current = getKeys(values.normalizeValue(props.value ?? []));
    previous.current = props.value;
  }
  const getSelectedKeys = () =>
    current.current.props.value !== undefined
      ? getKeys(values.normalizeValue(current.current.props.value))
      : local.current;
  const getLocalValues = () =>
    values.getLabelValues(
      local.current,
      values.getLabelValues(values.normalizeValue(current.current.props.defaultValue ?? [])),
    );
  const [foundation] = useState(() =>
    createTreeSelectFoundation<T, TreeModelNode<T>>({
      getNodes: () => current.current.view.nodes,
      getDisabled: () => !!current.current.props.disabled,
      getReadonly: () => !!current.current.props.readonly,
      getMultiple: () => !!(current.current.props.multiple || current.current.props.treeCheckable),
      getCheckable: () => !!current.current.props.treeCheckable,
      getCheckStrictly: () => !!current.current.props.treeCheckStrictly,
      getLabelInValue: () => !!current.current.props.labelInValue,
      getSelectedKeys,
      getLocalKeys: () => local.current,
      getLocalValues,
      getInputValue: () => current.current.props.inputValue ?? '',
      getRetainInput: () => !!current.current.props.retainInputValue,
      setLocalKeys: (keys) => {
        local.current = keys;
        render();
      },
      setPanelVisible: (visible) => current.current.view.setVisible(visible),
      updateInputValue: (value) => current.current.view.setInputValue(value),
      afterRender: (task) => {
        void afterRender().then(task);
      },
      onFormChange: () => current.current.view.onFormChange?.(),
      events: {
        updateValue: (value) => current.current.props.onValueChange?.(value),
        change: (value) => current.current.props.onChange?.(value),
        clear: () => current.current.props.onClear?.(),
      },
    }),
  );
  return {
    foundation,
    selectedKeys: getSelectedKeys(),
    selectedValues:
      props.value !== undefined
        ? values.getLabelValues(
            getSelectedKeys(),
            values.getLabelValues(values.normalizeValue(props.value)),
          )
        : getLocalValues(),
  };
}
