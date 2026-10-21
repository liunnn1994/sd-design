<template>
  <Tooltip :popup-visible="tipVisible" :content="readonlyTipText" position="top">
    <trigger
      v-bind="mergedTriggerProps"
      :floating-options="floatingOptions ?? mergedTriggerProps.floatingOptions"
      trigger="click"
      animation-name="slide-dynamic-origin"
      auto-fit-transform-origin
      :popup-visible="computedPopupVisible"
      position="bl"
      :disabled="mergedDisabled"
      :popup-offset="4"
      :auto-fit-popup-width="showSearchPanel"
      :popup-container="popupContainer"
      :prevent-focus="true"
      :click-to-close="!Boolean(mergedAllowSearch)"
      aria-has-popup="menu"
      @popup-visible-change="handlePopupVisibleChange"
    >
      <slot
        name="trigger"
        :value="triggerValue"
        :display-value="triggerDisplayValue"
        :input-value="computedInputValue"
        :selected-options="triggerSelectedOptions"
        :selected-paths="triggerSelectedPaths"
        :popup-visible="computedPopupVisible"
        :disabled="mergedDisabled"
        :loading="loading"
        :multiple="multiple"
      >
        <select-view
          :model-value="selectViewValue"
          :input-value="computedInputValue"
          :disabled="mergedDisabled"
          :error="error"
          :multiple="multiple"
          :allow-clear="mergedAllowClear"
          :allow-search="Boolean(mergedAllowSearch)"
          :size="size"
          :opened="computedPopupVisible"
          :placeholder="placeholder"
          :fit-width="fitWidth"
          :max-w-full="maxWFull"
          :loading="loading"
          :max-tag-count="maxTagCount"
          :tag-nowrap="tagNowrap"
          :input-attrs="triggerInputAttrs"
          v-bind="attrs"
          @input-value-change="handleInputValueChange"
          @clear="handleClear"
          @focus="handleFocus"
          @blur="handleBlur"
          @remove="handleRemove"
          @keydown="handleKeyDown"
        >
          <template v-if="$slots.label" #label="data">
            <slot name="label" v-bind="data" />
          </template>
          <template v-if="$slots.prefix" #prefix>
            <slot name="prefix" />
          </template>
          <template v-if="$slots['arrow-icon']" #arrow-icon>
            <slot name="arrow-icon" />
          </template>
          <template v-if="$slots['loading-icon']" #loading-icon>
            <slot name="loading-icon" />
          </template>
          <template v-if="$slots['search-icon']" #search-icon>
            <slot name="search-icon" />
          </template>
        </select-view>
      </slot>
      <template #content>
        <cascader-search-panel
          v-if="showSearchPanel"
          :options="filteredLeafOptions"
          :active-key="activeKey"
          :multiple="multiple"
          :check-strictly="checkStrictly"
          :loading="loading"
          :spin-props="resolvedSpinProps"
          :path-label="!searchOptionOnlyLabel"
        >
          <template v-if="$slots.empty" #empty>
            <slot name="empty" />
          </template>
        </cascader-search-panel>
        <base-cascader-panel
          v-else
          :display-columns="displayColumns"
          :selected-path="selectedPath"
          :active-key="activeKey"
          :multiple="multiple"
          :total-level="totalLevel"
          :check-strictly="checkStrictly"
          :loading="loading"
          :spin-props="resolvedSpinProps"
          :virtual-list-props="resolvedVirtualListProps"
          dropdown
        >
          <template v-if="$slots.empty" #empty>
            <slot name="empty" />
          </template>
        </base-cascader-panel>
      </template>
    </trigger>
  </Tooltip>
</template>

<script lang="ts" setup>
  import {
    computed,
    getCurrentInstance,
    inject,
    onBeforeUnmount,
    onBeforeUpdate,
    provide,
    reactive,
    ref,
    shallowRef,
    toRef,
    toRefs,
    useAttrs,
    useSlots,
    watch,
  } from 'vue';

  import { DEFAULT_FIELD_NAMES } from '@sdata/web-core/cascader/data';
  import { createCascaderFoundation } from '@sdata/web-core/cascader/foundation';
  import { createCascaderInteraction } from '@sdata/web-core/cascader/interaction';
  import { createCascaderKeyboard } from '@sdata/web-core/cascader/keyboard';
  import {
    getDefaultCascaderValue as getDefaultValue,
    getCascaderValueMap,
    filterCascaderOptions,
    getCascaderViewValues,
  } from '@sdata/web-core/cascader/values';

  import type { TagProps } from '../tag';
  import type {
    CascaderLazyLoadOptions,
    CascaderModelValue,
    CascaderOption,
    CascaderOptionInfo,
  } from './interface';
  import type { CascaderEmits, CascaderProps } from './types';

  import SelectView from '../_components/select-view/select-view.vue';
  import { useAllowClear } from '../_hooks/use-allow-clear';
  import { useAllowSearch } from '../_hooks/use-allow-search';
  import { useDropdownVirtualListProps } from '../_hooks/use-dropdown-virtual-list-props';
  import { useFormItem } from '../_hooks/use-form-item';
  import { useReadonlyTip, useReadonlyTipText } from '../_hooks/use-readonly-tip';
  import { useTrigger } from '../_hooks/use-trigger';
  import { isNull, isUndefined } from '../_utils/is';
  import { KEYBOARD_KEY, getKeyDownHandler } from '../_utils/keyboard';
  import { BaseType } from '../_utils/types';
  import { resolveDropdownVirtualListProps } from '../_utils/virtual-dropdown';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Tooltip from '../tooltip';
  import Trigger from '../trigger';
  import BaseCascaderPanel from './base-cascader-panel.vue';
  import CascaderSearchPanel from './cascader-search-panel.vue';
  import { cascaderInjectionKey } from './context';
  import { useLazyLoad } from './hooks/use-lazy-load';
  import { useSelectedPath } from './hooks/use-selected-path';
  import { getOptionInfos } from './utils';

  defineOptions({
    name: 'Cascader',
    inheritAttrs: false,
  });

  const props = withDefaults(defineProps<CascaderProps>(), {
    pathMode: false,
    multiple: false,
    ellipsis: true,
    options: () => [],
    disabled: false,
    readonly: false,
    error: false,
    allowClear: false,
    defaultInputValue: '',
    expandTrigger: 'click',
    defaultPopupVisible: false,
    maxTagCount: 0,
    showPath: true,
    separator: ' / ',
    checkStrictly: false,
    loading: false,
    searchOptionOnlyLabel: false,
    searchDelay: 500,
    valueKey: 'value',
    fallback: true,
    expandChild: false,
    tagNowrap: false,
    fitWidth: false,
    maxWFull: true,
  });

  const emit = defineEmits<CascaderEmits>();
  /**
   * @zh 自定义触发元素
   * @en Custom trigger element
   * @slot trigger
   */
  const attrs = useAttrs();
  const slots = useSlots();
  const configCtx = inject(configProviderInjectionKey, undefined);

  const DEFAULT_CASCADER_VIRTUAL_ITEM_SIZE = 36;

  const {
    options,
    checkStrictly,
    loadMore,
    formatLabel,
    modelValue,
    disabled,
    valueKey,
    expandTrigger,
    expandChild,
    pathMode,
    multiple,
    ellipsis,
    error,
    size,
    placeholder,
    loading,
    spinProps,
    maxTagCount,
    tagNowrap,
    popupContainer,
    floatingOptions,
    searchOptionOnlyLabel,
  } = toRefs(props);
  const resolvedSpinProps = computed(() => ({
    ...configCtx?.cascaderSpinProps,
    ...spinProps.value,
  }));

  const _value = ref<CascaderModelValue>(
    props.defaultValue ?? getDefaultValue(props.multiple, props.pathMode),
  );
  const _inputValue = ref(props.defaultInputValue);
  const instance = getCurrentInstance();
  const rawProps = shallowRef(instance?.vnode.props);
  onBeforeUpdate(() => {
    rawProps.value = instance?.vnode.props;
  });

  const { mergedDisabled, eventHandlers } = useFormItem({ disabled });
  const hasTriggerProp = (propNames: string[]) => {
    const vnodeProps = rawProps.value;
    return !!vnodeProps && propNames.some((propName) => Object.hasOwn(vnodeProps, propName));
  };
  const { mergedAllowSearch } = useAllowSearch(
    computed(() => props.allowSearch ?? props.multiple),
    {
      compatPropNames: ['filterable'],
      getCompatValue: () => props.filterable,
      getDefaultValue: () => props.multiple,
    },
  );
  const mergedAllowClearValue = computed(() => {
    const rawProps = instance?.vnode.props;
    const hasAllowClearProp =
      !!rawProps &&
      ['allowClear', 'allow-clear'].some((propName) => Object.hasOwn(rawProps, propName));

    if (hasAllowClearProp) {
      return props.allowClear;
    }

    return props.clearable ?? props.allowClear;
  });
  const { mergedAllowClear } = useAllowClear(mergedAllowClearValue, ['clearable']);
  const mergedPopupVisible = computed(() => {
    if (hasTriggerProp(['popupVisible', 'popup-visible'])) {
      return props.popupVisible;
    }

    return undefined;
  });
  const mergedShow = computed(() => {
    if (hasTriggerProp(['show'])) {
      return props.show;
    }

    return undefined;
  });
  const mergedDefaultPopupVisible = computed(() => {
    if (hasTriggerProp(['defaultPopupVisible', 'default-popup-visible'])) {
      return props.defaultPopupVisible;
    }

    return undefined;
  });
  const mergedDefaultShow = computed(() => {
    if (hasTriggerProp(['defaultShow', 'default-show'])) {
      return props.defaultShow;
    }

    return undefined;
  });
  const { computedPopupVisible, handlePopupVisibleChange: _handlePopupVisibleChange } = useTrigger({
    popupVisible: mergedPopupVisible,
    defaultPopupVisible: mergedDefaultPopupVisible,
    show: mergedShow,
    defaultShow: mergedDefaultShow,
    emit: emit as unknown as (
      event: 'update:popupVisible' | 'popupVisibleChange' | 'update:show' | 'showChange',
      visible: boolean,
    ) => void,
  });

  const { tipVisible, show: showReadonlyTip } = useReadonlyTip(
    toRef(props, 'readonly'),
    mergedDisabled,
  );
  const readonlyTipText = useReadonlyTipText(toRef(props, 'readonly'));

  const handlePopupVisibleChange = (visible: boolean) => {
    if (visible && props.readonly && !mergedDisabled.value) {
      showReadonlyTip();
      return;
    }
    _handlePopupVisibleChange(visible);
  };

  const mergedTriggerProps = computed(() => props.triggerProps ?? {});

  // combobox 语义落到触发器 <input>（经 SelectView inputAttrs）：role + 开合 + popup 类型 + 自动补全
  const triggerInputAttrs = computed(() => ({
    'role': 'combobox',
    'aria-expanded': computedPopupVisible.value,
    'aria-haspopup': 'menu',
    'aria-autocomplete': mergedAllowSearch.value ? 'list' : 'none',
  }));

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
        lazyLoadOptions,
        optionMap,
        leafOptionSet,
        leafOptionMap,
        leafOptionValueMap,
        totalLevel,
        checkStrictly,
        valueKey,
        fieldNames: _fieldNames,
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

  const computedInputValue = computed(() => props.inputValue ?? _inputValue.value);
  const { mergedDropdownVirtualListProps } = useDropdownVirtualListProps(
    computed(() => props.virtualListProps),
  );

  const resolvedVirtualListProps = computed(() => {
    return resolveDropdownVirtualListProps(
      mergedDropdownVirtualListProps.value,
      props.triggerProps,
      DEFAULT_CASCADER_VIRTUAL_ITEM_SIZE,
    );
  });

  const filteredLeafOptions = computed(() =>
    filterCascaderOptions(
      props.checkStrictly ? Array.from(optionMap.values()) : Array.from(leafOptionSet),
      computedInputValue.value,
      props.checkStrictly,
      props.filterOption,
    ),
  );

  const cascaderFoundation = createCascaderFoundation<TagProps>({
    getMultiple: () => props.multiple,
    getPathMode: () => props.pathMode,
    getCheckStrictly: () => props.checkStrictly,
    getReadonly: () => !!props.readonly,
    getValueMap: () => computedValueMap.value,
    getLeafOptions: () => leafOptionMap,
    setValue: (value) => {
      _value.value = value;
    },
    setSelectedPath: (key) => setSelectedPath(key),
    setActiveKey: (key) => setActiveKey(key),
    onReadonly: () => {
      showReadonlyTip();
    },
    updateValue: (value) => emit('update:modelValue', value),
    change: (value) => emit('change', value),
    onFormChange: () => eventHandlers.value?.onChange?.(),
    afterSingleSelect: () => handlePopupVisibleChange(false),
    afterMultipleSelect: () => handleInputValueChange('', 'optionChecked'),
  });
  const { click: handleClickOption, remove: handleRemove } = cascaderFoundation;
  watch([multiple, pathMode], cascaderFoundation.modeChanged);

  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  const handleSearch = (value: string) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchTimer = undefined;
      emit('search', value);
    }, props.searchDelay);
  };
  onBeforeUnmount(() => clearTimeout(searchTimer));

  const interaction = createCascaderInteraction<TagProps>({
    getInputValue: () => computedInputValue.value,
    getPopupVisible: () => computedPopupVisible.value,
    getAllowSearch: () => !!mergedAllowSearch.value,
    getValues: () => computedValueMap.value,
    getLeafOptions: () => leafOptionMap,
    getActiveKey: () => activeKey.value,
    setInputValue: (value) => {
      _inputValue.value = value;
    },
    setPopupVisible: handlePopupVisibleChange,
    setSelectedPath: (key) => setSelectedPath(key),
    setActiveKey: (key) => setActiveKey(key),
    clearSelection: cascaderFoundation.clear,
    inputChange: (value) => emit('inputValueChange', value),
    search: handleSearch,
    clear: () => emit('clear'),
  });
  const handleInputValueChange = interaction.inputChange;
  watch(computedPopupVisible, interaction.popupChanged);
  const handleClear = (event: MouseEvent) => {
    event.stopPropagation();
    interaction.clear();
  };

  const showSearchPanel = computed(
    () => Boolean(mergedAllowSearch.value) && computedInputValue.value.length > 0,
  );

  const handleFocus = (e: FocusEvent) => {
    emit('focus', e);
  };

  const handleBlur = (e: FocusEvent) => {
    emit('blur', e);
  };

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
    showSearchPanel,
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
      expandTrigger,
      ellipsis,
      formatLabel,
      separator: toRef(props, 'separator'),
      slots,
      valueMap: computedValueMap,
    }),
  );

  const cascaderKeydown = createCascaderKeyboard<TagProps>({
    getPopupVisible: () => computedPopupVisible.value,
    getActiveOption: () => activeOption.value,
    getCheckStrictly: () => props.checkStrictly,
    getValues: () => computedValueMap.value,
    getSearchPanel: () => showSearchPanel.value,
    next: getNextActiveNode,
    load: loadOption,
    select: handleClickOption,
    setSelectedPath,
    setActiveKey,
    setPopupVisible: handlePopupVisibleChange,
  });
  const handleKeyDown = getKeyDownHandler(
    new Map([
      [KEYBOARD_KEY.ENTER, (event: Event) => cascaderKeydown('Enter', event)],
      [KEYBOARD_KEY.ESC, (event: Event) => cascaderKeydown('Escape', event)],
      [KEYBOARD_KEY.ARROW_DOWN, (event: Event) => cascaderKeydown('ArrowDown', event)],
      [KEYBOARD_KEY.ARROW_UP, (event: Event) => cascaderKeydown('ArrowUp', event)],
      [KEYBOARD_KEY.ARROW_RIGHT, (event: Event) => cascaderKeydown('ArrowRight', event)],
      [KEYBOARD_KEY.ARROW_LEFT, (event: Event) => cascaderKeydown('ArrowLeft', event)],
    ]),
  );

  const selectViewValue = computed(() =>
    getCascaderViewValues(computedValueMap.value, leafOptionMap, {
      showPath: props.showPath,
      separator: props.separator,
      formatLabel: props.formatLabel,
      fallback: props.fallback,
    }),
  );

  const triggerValue = computed<CascaderModelValue>(() => {
    const values = Array.from(computedValueMap.value.values());
    return props.multiple ? values : (values[0] ?? '');
  });
  const triggerDisplayValue = computed(() => {
    const labels = selectViewValue.value.map((item) => item.label);
    return props.multiple ? labels : (labels[0] ?? '');
  });
  const triggerSelectedPaths = computed(() =>
    Array.from(computedValueMap.value.keys())
      .map((key) => leafOptionMap.get(key)?.path.map((item) => item.raw))
      .filter((path): path is CascaderOption[] => Boolean(path)),
  );
  const triggerSelectedOptions = computed(() =>
    triggerSelectedPaths.value
      .map((path) => path.at(-1))
      .filter((option): option is CascaderOption => Boolean(option)),
  );
</script>
