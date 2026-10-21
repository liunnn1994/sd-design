import { computed, ref, toRefs, watchEffect, watch } from 'vue';

import { createTreeSelectValues, getKeys } from '@sdata/web-core/tree-select/values';

import {
  Key2TreeNode,
  TreeFieldNames,
  TreeNodeData,
  TreeNodeKey,
  Node,
} from '../../tree/interface';
import { FallbackOption, LabelValue, TreeSelectValue } from '../interface';

export default function useSelectedState(props: {
  defaultValue?: TreeSelectValue;
  modelValue?: TreeSelectValue;
  key2TreeNode: Key2TreeNode;
  multiple?: boolean;
  treeCheckable?: boolean;
  treeCheckStrictly?: boolean;
  fallbackOption?: FallbackOption;
  fieldNames?: TreeFieldNames;
  showPath?: boolean;
  separator?: string;
}) {
  const {
    defaultValue,
    modelValue,
    key2TreeNode,
    multiple,
    treeCheckable,
    fallbackOption,
    fieldNames,
    showPath,
    separator,
  } = toRefs(props);

  const { normalizeValue, getLabelValues } = createTreeSelectValues<TreeNodeData, Node>({
    getNodes: () => key2TreeNode.value,
    getShowPath: () => showPath?.value,
    getFieldNames: () => fieldNames?.value,
    getSeparator: () => separator?.value,
    getMultiple: () => multiple?.value,
    getCheckable: () => treeCheckable?.value,
    getFallbackOption: () => fallbackOption?.value,
  });

  const computedModelValueKeys = ref<TreeNodeKey[]>();
  const computedModelValue = ref<LabelValue[]>();
  watchEffect(() => {
    const isControlled = modelValue?.value !== undefined;
    const normalizeModelValue = normalizeValue(modelValue?.value ?? []);
    const modelValueKeys = getKeys(normalizeModelValue);
    computedModelValue.value = isControlled
      ? getLabelValues(modelValueKeys, getLabelValues(normalizeModelValue))
      : undefined;
    computedModelValueKeys.value = isControlled ? modelValueKeys : undefined;
  });

  const normalizeDefaultValue = normalizeValue(defaultValue?.value ?? []);
  const defaultKeys = getKeys(normalizeDefaultValue);
  const defaultLabelValues = computed(() =>
    getLabelValues(defaultKeys, getLabelValues(normalizeDefaultValue)),
  );
  const localValueKeys = ref(defaultKeys || []);
  const localValue = ref(defaultLabelValues.value);
  watch([localValueKeys, key2TreeNode, fieldNames, showPath, separator, defaultLabelValues], () => {
    localValue.value = getLabelValues(localValueKeys.value, defaultLabelValues.value);
  });
  watch([computedModelValueKeys, computedModelValue], ([valueKeys, value]) => {
    localValueKeys.value = valueKeys || [];
    localValue.value = value || [];
  });

  const selectedKeys = computed(() => computedModelValueKeys.value ?? localValueKeys.value);
  const selectedValue = computed(() => computedModelValue.value ?? localValue.value);

  return {
    selectedKeys,
    selectedValue,
    setLocalSelectedKeys(keys: TreeNodeKey[]) {
      localValueKeys.value = keys;
    },
    localSelectedKeys: localValueKeys,
    localSelectedValue: localValue,
  };
}
