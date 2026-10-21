<template>
  <base-cascader-panel
    :display-columns="displayColumns"
    :selected-path="selectedPath"
    :active-key="activeKey"
    :multiple="multiple"
    :total-level="totalLevel"
    :check-strictly="checkStrictly"
    @keydown="handleKeyDown"
  >
    <template v-if="$slots.empty" #empty>
      <slot name="empty" />
    </template>
  </base-cascader-panel>
</template>

<script setup lang="ts">
  import { computed, provide, reactive, ref, toRefs, useSlots, watch } from 'vue';

  import { DEFAULT_FIELD_NAMES } from '@sdata/web-core/cascader/data';
  import { createCascaderFoundation } from '@sdata/web-core/cascader/foundation';
  import { createCascaderKeyboard } from '@sdata/web-core/cascader/keyboard';
  import {
    getDefaultCascaderValue as getDefaultValue,
    getCascaderValueMap,
  } from '@sdata/web-core/cascader/values';

  import type { TagProps } from '../tag';
  import type {
    CascaderLazyLoadOptions,
    CascaderModelValue,
    CascaderOption,
    CascaderOptionInfo,
  } from './interface';
  import type { CascaderPanelEmits, CascaderPanelProps } from './types';

  import { isNull, isUndefined } from '../_utils/is';
  import { KEYBOARD_KEY, getKeyDownHandler } from '../_utils/keyboard';
  import { BaseType } from '../_utils/types';
  import BaseCascaderPanel from './base-cascader-panel.vue';
  import { cascaderInjectionKey } from './context';
  import { useLazyLoad } from './hooks/use-lazy-load';
  import { useSelectedPath } from './hooks/use-selected-path';
  import { getOptionInfos } from './utils';

  defineOptions({
    name: 'CascaderPanel',
  });

  const props = withDefaults(defineProps<CascaderPanelProps>(), {
    pathMode: false,
    multiple: false,
    ellipsis: true,
    options: () => [],
    expandTrigger: 'click',
    checkStrictly: false,
    valueKey: 'value',
    expandChild: false,
  });

  const emit = defineEmits<CascaderPanelEmits>();
  const slots = useSlots();

  const {
    options,
    checkStrictly,
    loadMore,
    modelValue,
    valueKey,
    expandChild,
    expandTrigger,
    multiple,
    ellipsis,
    pathMode,
  } = toRefs(props);

  const _value = ref<CascaderModelValue>(
    props.defaultValue ?? getDefaultValue(props.multiple, props.pathMode),
  );

  watch(modelValue, (nextModelValue) => {
    if (isUndefined(nextModelValue) || isNull(nextModelValue)) {
      _value.value = getDefaultValue(props.multiple, props.pathMode);
    }
  });

  const optionInfos = ref<CascaderOptionInfo[]>([]);
  const totalLevel = ref(1);

  const optionMap = reactive(new Map<string, CascaderOptionInfo>());
  const leafOptionMap = reactive(new Map<string, CascaderOptionInfo>());
  const leafOptionValueMap = reactive(new Map<BaseType, string>());
  const leafOptionSet = reactive(new Set<CascaderOptionInfo>());

  const lazyLoadOptions = reactive<CascaderLazyLoadOptions>({});

  const addLazyLoadOptions = (children: CascaderOption[], key: string) => {
    const source = optionMap.get(key)?.raw;
    if (source) lazyLoadOptions[key] = { source, children };
  };

  const { loadOption, isLoading } = useLazyLoad(loadMore, optionMap, addLazyLoadOptions);

  const mergedFieldNames = computed(() => ({
    ...DEFAULT_FIELD_NAMES,
    ...props.fieldNames,
  }));

  watch(
    [options, lazyLoadOptions, mergedFieldNames, loadMore, checkStrictly, valueKey],
    ([_options, _lazyLoadOptions, _fieldNames]) => {
      optionMap.clear();
      leafOptionMap.clear();
      leafOptionValueMap.clear();
      leafOptionSet.clear();

      optionInfos.value = getOptionInfos(_options ?? [], {
        enabledLazyLoad: Boolean(props.loadMore),
        lazyLoadOptions: _lazyLoadOptions,
        optionMap,
        leafOptionSet,
        leafOptionMap,
        leafOptionValueMap,
        totalLevel,
        checkStrictly,
        fieldNames: _fieldNames,
        valueKey,
      });
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const computedValueMap = computed(() =>
    getCascaderValueMap(props.modelValue ?? _value.value, {
      multiple: props.multiple,
      pathMode: props.pathMode,
      valueKey: props.valueKey,
      leafOptionValueMap,
    }),
  );

  const filteredLeafOptions = computed(() =>
    props.checkStrictly ? Array.from(optionMap.values()) : Array.from(leafOptionSet),
  );

  const cascaderFoundation = createCascaderFoundation<TagProps>({
    getMultiple: () => props.multiple,
    getPathMode: () => props.pathMode,
    getCheckStrictly: () => props.checkStrictly,
    getValueMap: () => computedValueMap.value,
    getLeafOptions: () => leafOptionMap,
    setValue: (value) => {
      _value.value = value;
    },
    setSelectedPath: (key) => setSelectedPath(key),
    setActiveKey: (key) => setActiveKey(key),
    updateValue: (value) => emit('update:modelValue', value),
    change: (value) => emit('change', value),
  });
  const { click: handleClickOption } = cascaderFoundation;

  const {
    activeKey,
    activeOption,
    selectedPath,
    displayColumns,
    setActiveKey,
    setSelectedPath,
    getNextActiveNode,
  } = useSelectedPath(optionInfos, {
    optionMap,
    filteredLeafOptions,
    expandChild,
  });

  provide(
    cascaderInjectionKey,
    reactive({
      onClickOption: handleClickOption,
      setActiveKey,
      setSelectedPath,
      loadOption,
      isLoading,
      slots,
      valueMap: computedValueMap,
      // 传入 ref 而非 .value，reactive 会在属性访问时解包并保持响应式，
      // 独立面板上修改 expandTrigger/ellipsis prop 才能生效（与 cascader.vue 一致）
      expandTrigger,
      ellipsis,
    }),
  );

  const cascaderKeydown = createCascaderKeyboard<TagProps>({
    getPopupVisible: () => true,
    getActiveOption: () => activeOption.value,
    getCheckStrictly: () => props.checkStrictly,
    getValues: () => computedValueMap.value,
    getSearchPanel: () => false,
    next: getNextActiveNode,
    load: loadOption,
    select: handleClickOption,
    setSelectedPath,
    setActiveKey,
  });
  const handleKeyDown = getKeyDownHandler(
    new Map([
      [KEYBOARD_KEY.ENTER, (event: Event) => cascaderKeydown('Enter', event)],
      [KEYBOARD_KEY.ARROW_DOWN, (event: Event) => cascaderKeydown('ArrowDown', event)],
      [KEYBOARD_KEY.ARROW_UP, (event: Event) => cascaderKeydown('ArrowUp', event)],
      [KEYBOARD_KEY.ARROW_RIGHT, (event: Event) => cascaderKeydown('ArrowRight', event)],
      [KEYBOARD_KEY.ARROW_LEFT, (event: Event) => cascaderKeydown('ArrowLeft', event)],
    ]),
  );
</script>
