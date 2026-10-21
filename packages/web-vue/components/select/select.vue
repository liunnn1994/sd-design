<template>
  <DefineOptionLabel v-slot="{ label }">
    <template v-if="props.ellipsis === false">{{ label }}</template>
    <component
      :is="props.ellipsis === 'performant-ellipsis' ? PerformantEllipsis : Ellipsis"
      v-else
    >
      {{ label }}
    </component>
  </DefineOptionLabel>
  <DefineOptionContent v-slot="{ optionInfo }">
    <slot v-if="slots.option" name="option" :data="optionInfo.raw" />
    <ReuseOptionLabel v-else :label="optionInfo.label" />
  </DefineOptionContent>
  <DefineOption v-slot="{ optionInfo }">
    <li
      v-if="isGroupOptionInfo(optionInfo)"
      :key="optionInfo.key"
      role="group"
      :aria-label="optionInfo.label"
      :class="groupPrefixCls"
    >
      <div :class="`${groupPrefixCls}-title`">
        <ReuseOptionLabel :label="optionInfo.label" />
      </div>
      <ReuseOption v-for="child in optionInfo.options" :key="child.key" :option-info="child" />
    </li>
    <component
      :is="component"
      v-else-if="isOptionVisible(optionInfo)"
      :id="optionId(optionInfo.key)"
      :key="optionInfo.key"
      :ref="(element: unknown) => setOptionRef(optionInfo.key, element)"
      :class="getOptionClass(optionInfo)"
      role="option"
      :aria-selected="isOptionSelected(optionInfo)"
      :aria-disabled="optionInfo.disabled || undefined"
      @click="handleOptionClick(optionInfo, $event)"
      @mouseenter="handleOptionMouseEnter(optionInfo)"
      @mouseleave="handleOptionMouseLeave(optionInfo)"
    >
      <Checkbox
        v-if="props.multiple"
        :class="`${optionPrefixCls}-checkbox`"
        :model-value="isOptionSelected(optionInfo)"
        :disabled="optionInfo.disabled"
        uninject-group-context
      >
        <ReuseOptionContent :option-info="optionInfo" />
      </Checkbox>
      <span v-else :class="`${optionPrefixCls}-content`">
        <ReuseOptionContent :option-info="optionInfo" />
      </span>
    </component>
  </DefineOption>

  <Tooltip :popup-visible="tipVisible" :content="readonlyTipText" position="top">
    <Trigger v-bind="triggerBindings">
      <template #content>
        <SelectDropdown
          ref="dropdownRef"
          :loading="props.loading"
          :spin-props="mergedSpinProps"
          :empty="validOptionInfos.length === 0"
          :virtual-list="Boolean(resolvedVirtualListProps)"
          :scrollbar="props.scrollbar"
          :show-header-on-empty="props.showHeaderOnEmpty"
          :show-footer-on-empty="props.showFooterOnEmpty"
          @scroll="handleDropdownScroll"
          @reach-bottom="handleDropdownReachBottom"
        >
          <ReuseOption
            v-for="optionInfo in validOptions"
            :key="optionInfo.key"
            :option-info="optionInfo"
          />
          <template #virtual-list>
            <VirtualList
              v-bind="resolvedVirtualListProps"
              ref="virtualListRef"
              :items="validOptions"
            >
              <template #item="{ item }">
                <ReuseOption :option-info="item" />
              </template>
            </VirtualList>
          </template>
          <template v-if="$slots.empty" #empty><slot name="empty" /></template>
          <template v-if="$slots.header" #header><slot name="header" /></template>
          <template v-if="$slots.footer" #footer><slot name="footer" /></template>
        </SelectDropdown>
      </template>

      <slot name="trigger" v-bind="triggerSlotProps">
        <SelectView v-bind="selectViewBindings" ref="selectViewRef">
          <template #label="slotProps"
            ><VNodeRenderer :content="renderLabel(slotProps)"
          /></template>
          <template #tag="slotProps"><VNodeRenderer :content="renderTag(slotProps)" /></template>
          <template v-if="$slots.prefix" #prefix><slot name="prefix" /></template>
          <template v-if="$slots['arrow-icon']" #arrow-icon><slot name="arrow-icon" /></template>
          <template v-if="$slots['loading-icon']" #loading-icon
            ><slot name="loading-icon"
          /></template>
          <template v-if="$slots['search-icon']" #search-icon><slot name="search-icon" /></template>
        </SelectView>
      </slot>
    </Trigger>
  </Tooltip>
</template>

<script setup lang="ts">
  import type { ComponentPublicInstance, PropType, VNodeChild } from 'vue';
  import {
    computed,
    getCurrentInstance,
    getCurrentScope,
    inject,
    nextTick,
    onBeforeUnmount,
    ref,
    toRaw,
    toRef,
    toRefs,
    watch,
    watchEffect,
    useAttrs,
    useSlots,
  } from 'vue';

  import { createSelectFoundation } from '@sdata/web-core/select/foundation';
  import { DEFAULT_FIELD_NAMES } from '@sdata/web-core/select/options';
  import { getValueObjects, hasExtraValueChanges } from '@sdata/web-core/select/values';
  import { createReusableTemplate } from '@vueuse/core';

  import type { SelectViewValue } from '../_components/select-view/interface';
  import type { VirtualListProps } from '../_components/virtual-list/interface';
  import type { Size } from '../_utils/constant';
  import type { FloatingOptions } from '../_utils/floating';
  import type { ScrollbarProps } from '../scrollbar';
  import type { SpinProps } from '../spin';
  import type {
    OptionValueWithKey,
    SelectFieldNames,
    SelectModelValue,
    SelectOption,
    SelectOptionData,
    SelectOptionGroupInfo,
    SelectOptionInfo,
    SelectOptionValue,
  } from './interface';

  import SelectView from '../_components/select-view/select-view.vue';
  import VirtualList from '../_components/virtual-list';
  import { useAllowClear } from '../_hooks/use-allow-clear';
  import { useAllowSearch } from '../_hooks/use-allow-search';
  import { useDropdownVirtualListProps } from '../_hooks/use-dropdown-virtual-list-props';
  import { useFormItem } from '../_hooks/use-form-item';
  import { useReadonlyTip, useReadonlyTipText } from '../_hooks/use-readonly-tip';
  import { useTrigger } from '../_hooks/use-trigger';
  import { debounce } from '../_utils/debounce';
  import { getPrefixCls } from '../_utils/global-config';
  import { isNull, isObject, isUndefined } from '../_utils/is';
  import { resolveDropdownVirtualListProps } from '../_utils/virtual-dropdown';
  import Checkbox from '../checkbox';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Ellipsis, { PerformantEllipsis } from '../ellipsis';
  import Tooltip from '../tooltip';
  import Trigger, { type TriggerProps } from '../trigger';
  import { useSelect } from './hooks/use-select';
  import SelectDropdown from './select-dropdown.vue';
  import { isGroupOptionInfo, isValidOption } from './utils';

  const DEFAULT_SELECT_VIRTUAL_ITEM_SIZE = 36;

  interface SelectViewInstance {
    focus?: () => void;
    blur?: () => void;
  }

  defineOptions({ name: 'Select', inheritAttrs: false });

  const [DefineOptionLabel, ReuseOptionLabel] = createReusableTemplate<{ label: string }>();
  const [DefineOptionContent, ReuseOptionContent] = createReusableTemplate<{
    optionInfo: SelectOptionInfo;
  }>();

  const props = defineProps({
    multiple: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: [String, Number, Boolean, Object, Array] as PropType<SelectModelValue>,
      default: undefined,
    },
    defaultValue: {
      type: [String, Number, Boolean, Object, Array] as PropType<SelectModelValue>,
      default: (props: { multiple?: boolean }) => (props.multiple ? [] : ''),
    },
    inputValue: {
      type: String,
    },
    defaultInputValue: {
      type: String,
      default: '',
    },
    size: {
      type: String as PropType<Size>,
    },
    placeholder: String,
    /**
     * @zh 宽度是否适应文字内容
     * @en Whether the width adapts to the text content
     */
    fitWidth: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 最大宽度是否限制为父容器宽度
     * @en Whether the maximum width is limited to the parent container width
     */
    maxWFull: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 传递给下拉加载中 Spin 的属性
     * @en Props passed to the loading Spin in the dropdown
     */
    spinProps: {
      type: Object as PropType<SpinProps>,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否为只读状态
     * @en Whether it is read-only
     */
    readonly: {
      type: [Boolean, String],
      default: false,
    },
    error: {
      type: Boolean,
      default: false,
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    allowSearch: {
      type: [Boolean, Object] as PropType<boolean | { retainInputValue?: boolean }>,
      default: true,
    },
    allowCreate: {
      type: Boolean,
      default: false,
    },
    showArrow: {
      type: Boolean,
      default: true,
    },
    maxTagCount: {
      type: [Number, String] as PropType<number | 'responsive'>,
      default: 'responsive',
    },
    popupContainer: {
      type: [String, Object] as PropType<string | HTMLElement>,
    },
    bordered: {
      type: Boolean,
      default: true,
    },
    defaultActiveFirstOption: {
      type: Boolean,
      default: true,
    },
    popupVisible: {
      type: Boolean,
      default: undefined,
    },
    show: {
      type: Boolean,
      default: undefined,
    },
    defaultPopupVisible: {
      type: Boolean,
      default: undefined,
    },
    defaultShow: {
      type: Boolean,
      default: undefined,
    },
    unmountOnClose: {
      type: Boolean,
      default: false,
    },
    filterOption: {
      type: [Boolean, Function] as PropType<
        boolean | ((inputValue: string, option: SelectOptionData) => boolean)
      >,
      default: true,
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      default: () => [],
    },
    /**
     * @zh 是否使用 Ellipsis 组件渲染选项。传入 `performant-ellipsis` 时使用高性能省略实现
     * @en Whether to render options with the Ellipsis component. Use `performant-ellipsis` for the performant implementation
     */
    ellipsis: {
      type: [Boolean, String] as PropType<boolean | 'performant-ellipsis'>,
      default: true,
    },
    virtualListProps: {
      type: Object as PropType<VirtualListProps>,
    },
    triggerProps: {
      type: Object as PropType<TriggerProps>,
    },
    floatingOptions: {
      type: Object as PropType<FloatingOptions>,
    },
    fallbackOption: {
      type: [Boolean, Function] as PropType<
        boolean | ((value: SelectOptionValue) => SelectOptionData)
      >,
      default: true,
    },
    showExtraOptions: {
      type: Boolean,
      default: true,
    },
    valueKey: {
      type: String,
      default: 'value',
    },
    searchDelay: {
      type: Number,
      default: 500,
    },
    limit: {
      type: Number,
      default: 0,
    },
    fieldNames: {
      type: Object as PropType<SelectFieldNames>,
    },
    scrollbar: {
      type: [Boolean, Object] as PropType<boolean | ScrollbarProps>,
      default: true,
    },
    showHeaderOnEmpty: {
      type: Boolean,
      default: false,
    },
    showFooterOnEmpty: {
      type: Boolean,
      default: false,
    },
    tagNowrap: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits<{
    'update:modelValue': [_value: SelectModelValue];
    'update:inputValue': [_inputValue: string];
    'update:popupVisible': [_visible: boolean];
    'update:show': [_visible: boolean];
    /**
     * @zh 选中值变化时触发
     * @en Trigger when the selected value changes
     */
    'change': [_value: SelectModelValue];
    /**
     * @zh 输入框值变化时触发
     * @en Trigger when the input value changes
     */
    'inputValueChange': [_inputValue: string];
    /**
     * @zh 下拉框显示状态变化时触发
     * @en Trigger when the popup visibility changes
     */
    'popupVisibleChange': [_visible: boolean];
    /**
     * @zh 下拉框显示状态变化时触发
     * @en Trigger when the dropdown visibility changes
     */
    'showChange': [_visible: boolean];
    /**
     * @zh 点击清除按钮时触发
     * @en Trigger when the clear button is clicked
     */
    'clear': [_ev: Event];
    /**
     * @zh 移除选项时触发
     * @en Trigger when an option is removed
     */
    'remove': [_removed: SelectOptionValue | undefined];
    /**
     * @zh 搜索时触发
     * @en Trigger while searching
     */
    'search': [_inputValue: string];
    /**
     * @zh 下拉列表滚动时触发
     * @en Trigger when the dropdown scrolls
     */
    'dropdownScroll': [_ev: Event];
    /**
     * @zh 下拉列表滚动到底部时触发
     * @en Trigger when the dropdown reaches the bottom
     */
    'dropdownReachBottom': [_ev: Event];
    /**
     * @zh 超出可选数量限制时触发
     * @en Trigger when the selection limit is exceeded
     */
    'exceedLimit': [_value: SelectOptionValue | undefined, _ev: Event];
  }>();
  const slots = useSlots();
  const attrs = useAttrs();
  const VNodeRenderer = ({ content }: { content: VNodeChild }) => content;
  const [DefineOption, ReuseOption] = createReusableTemplate<{
    optionInfo: SelectOptionInfo | SelectOptionGroupInfo;
  }>();
  const configCtx = inject(configProviderInjectionKey, undefined);
  const mergedSpinProps = computed(() => ({
    ...configCtx?.selectSpinProps,
    ...props.spinProps,
  }));
  const {
    size,
    disabled,
    error,
    options,
    filterOption,
    valueKey,
    multiple,
    popupVisible,
    show,
    defaultPopupVisible,
    defaultShow,
    showExtraOptions,
    loading,
    defaultActiveFirstOption,
    allowClear,
    allowSearch,
  } = toRefs(props);

  const prefixCls = getPrefixCls('select');
  const selectViewRef = ref<ComponentPublicInstance<SelectViewInstance> | null>(null);
  const { mergedSize, mergedDisabled, mergedError, eventHandlers } = useFormItem({
    size,
    disabled,
    error,
  });
  const { mergedAllowClear } = useAllowClear(allowClear);
  const { mergedAllowSearch } = useAllowSearch(allowSearch);
  const { mergedDropdownVirtualListProps } = useDropdownVirtualListProps(
    computed(() => props.virtualListProps),
  );
  const component = computed(() => (mergedDropdownVirtualListProps.value ? 'div' : 'li'));
  const retainInputValue = computed(
    () => isObject(mergedAllowSearch.value) && Boolean(mergedAllowSearch.value.retainInputValue),
  );

  const dropdownRef = ref<ComponentPublicInstance>();
  const optionRefs = ref<Record<string, HTMLElement>>({});
  const virtualListRef = ref();
  const resolvedVirtualListProps = computed<VirtualListProps | undefined>(() => {
    return resolveDropdownVirtualListProps(
      mergedDropdownVirtualListProps.value,
      props.triggerProps,
      DEFAULT_SELECT_VIRTUAL_ITEM_SIZE,
    );
  });

  const { computedPopupVisible, handlePopupVisibleChange: _handlePopupVisibleChange } = useTrigger({
    popupVisible,
    defaultPopupVisible,
    show,
    defaultShow,
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

  const _value = ref<SelectModelValue>(props.defaultValue);
  const computedValueObjects = computed<OptionValueWithKey[]>(() => {
    const mergedValue = props.modelValue !== undefined ? props.modelValue : _value.value;
    return getValueObjects(mergedValue, props.valueKey);
  });

  watch(
    () => props.modelValue,
    (nextModelValue) => {
      if (isUndefined(nextModelValue) || isNull(nextModelValue)) {
        _value.value = multiple.value ? [] : nextModelValue;
      }
    },
  );

  const computedValueKeys = computed(() => computedValueObjects.value.map((item) => item.key));
  const mergedFieldNames = computed(() => ({
    ...DEFAULT_FIELD_NAMES,
    ...props.fieldNames,
  }));

  const selectedOptionMap = ref<Record<string, unknown>>({});
  const selectFoundation = createSelectFoundation<Event>({
    getOptions: () => optionInfoMap,
    getMultiple: () => props.multiple,
    getReadonly: () => !!props.readonly,
    getLimit: () => props.limit,
    getValueKey: () => props.valueKey,
    getFieldNames: () => mergedFieldNames.value,
    getAllowCreate: () => props.allowCreate,
    getFallbackOption: () => props.fallbackOption,
    getInputValue: () => computedInputValue.value,
    getValueObjects: () => computedValueObjects.value,
    getValueKeys: () => computedValueKeys.value,
    getEnabledKeys: () => enabledOptionKeys.value,
    getPopupVisible: () => computedPopupVisible.value,
    getRetainInput: () => retainInputValue.value,
    getAllowSearch: () => !!mergedAllowSearch.value,
    getSelectedOptions: () => selectedOptionMap.value,
    setSelectedOptions: (options) => {
      selectedOptionMap.value = options;
    },
    setValue: (value) => {
      _value.value = value;
    },
    setInputValue: (value) => {
      _inputValue.value = value;
    },
    setPopupVisible: handlePopupVisibleChange,
    search: (value) => handleSearch(value),
    onFormChange: () => eventHandlers.value?.onChange?.(),
    events: {
      updateValue: (value) => emit('update:modelValue', value),
      change: (value) => emit('change', value),
      updateInput: (value) => emit('update:inputValue', value),
      inputChange: (value) => emit('inputValueChange', value),
      exceedLimit: (value, event) => emit('exceedLimit', value, event),
      remove: (value) => emit('remove', value),
      clear: (event) => emit('clear', event),
    },
  });
  const getExtraValueData = selectFoundation.getExtraValueData;

  const extraValueObjects = ref<OptionValueWithKey[]>([]);
  const extraOptions = computed(() => selectFoundation.getExtraOptions(extraValueObjects.value));

  const componentScope = getCurrentScope();
  nextTick(() => {
    if (!componentScope?.active) return;
    componentScope.run(() => {
      watchEffect(() => {
        const valueData = getExtraValueData();
        if (hasExtraValueChanges(valueData, extraValueObjects.value, toRaw))
          extraValueObjects.value = valueData;
      });
    });
  });

  const _inputValue = ref(props.defaultInputValue);
  const computedInputValue = computed(() => props.inputValue ?? _inputValue.value);

  watch(computedPopupVisible, selectFoundation.popupChanged);
  const { handleSelect } = selectFoundation;

  const handleSearch = debounce((value: string) => {
    emit('search', value);
  }, props.searchDelay);
  onBeforeUnmount(handleSearch.cancel);

  const { handleInputValueChange, handleRemove } = selectFoundation;
  const handleClear = (event: Event) => {
    event.stopPropagation();
    selectFoundation.handleClear(event);
  };

  const handleDropdownScroll = (event: Event) => {
    emit('dropdownScroll', event);
  };

  const handleDropdownReachBottom = (event: Event) => {
    emit('dropdownReachBottom', event);
  };

  const {
    validOptions,
    optionInfoMap,
    validOptionInfos,
    enabledOptionKeys,
    activeKey,
    setActiveKey,
    handleKeyDown,
  } = useSelect({
    multiple,
    options,
    extraOptions,
    inputValue: computedInputValue,
    filterOption,
    showExtraOptions,
    component,
    valueKey,
    fieldNames: toRef(props, 'fieldNames'),
    loading,
    popupVisible: computedPopupVisible,
    valueKeys: computedValueKeys,
    dropdownRef,
    optionRefs,
    virtualListRef,
    defaultActiveFirstOption,
    onSelect: handleSelect,
    onPopupVisibleChange: handlePopupVisibleChange,
  });

  const selectViewValue = computed<SelectViewValue[]>(() => {
    const result: SelectViewValue[] = [];

    for (const item of computedValueObjects.value) {
      const optionInfo = optionInfoMap.get(item.key);
      if (!optionInfo) {
        continue;
      }

      result.push({
        ...optionInfo,
        value: item.key,
        label:
          optionInfo.label ??
          String(isObject(item.value) ? item.value[valueKey.value] : item.value),
        closable: !optionInfo.disabled,
        tagProps: optionInfo.tagProps,
        option: optionInfo.raw,
      });
    }

    return result;
  });
  const triggerValue = computed<SelectModelValue>(() => {
    const values = computedValueObjects.value.map((item) => item.value);
    return props.multiple ? values : values[0];
  });
  const triggerDisplayValue = computed(() => {
    const labels = selectViewValue.value.map((item) => String(item.label));
    return props.multiple ? labels : (labels[0] ?? '');
  });
  const triggerSelectedOptions = computed(() =>
    selectViewValue.value
      .map((item) => item.option)
      .filter((option): option is SelectOptionData => Boolean(option)),
  );

  const optionPrefixCls = getPrefixCls('select-option');
  const groupPrefixCls = getPrefixCls('select-group');
  // 选项的稳定 id，供触发器 input 的 aria-activedescendant 引用。带实例 uid 前缀，
  // 避免同页多个 sd-select 选项 key 相同时产生重复 id / 错误的 aria-activedescendant 解析。
  const optionInstanceUid = getCurrentInstance()!.uid;
  const optionId = (key: string) => `${optionPrefixCls}-${optionInstanceUid}-${key}`;

  const isOptionVisible = (optionInfo: SelectOptionInfo) =>
    isValidOption(optionInfo, {
      inputValue: computedInputValue.value,
      filterOption: filterOption.value,
    });
  const isOptionSelected = (optionInfo: SelectOptionInfo) =>
    computedValueKeys.value.includes(optionInfo.key);
  const getOptionClass = (optionInfo: SelectOptionInfo) => [
    optionPrefixCls,
    {
      [`${optionPrefixCls}-disabled`]: optionInfo.disabled,
      [`${optionPrefixCls}-selected`]: isOptionSelected(optionInfo),
      [`${optionPrefixCls}-active`]: activeKey.value === optionInfo.key,
      [`${optionPrefixCls}-multiple`]: props.multiple,
    },
  ];
  const setOptionRef = (key: string, value: unknown) => {
    const element = (value as (ComponentPublicInstance & { $el?: Element }) | null)?.$el ?? value;
    if (element instanceof HTMLElement) optionRefs.value[key] = element;
    else delete optionRefs.value[key];
  };
  const handleOptionClick = (optionInfo: SelectOptionInfo, event: MouseEvent) => {
    if (!optionInfo.disabled) handleSelect(optionInfo.key, event);
  };
  const handleOptionMouseEnter = (optionInfo: SelectOptionInfo) => {
    if (!optionInfo.disabled) setActiveKey(optionInfo.key);
  };
  const handleOptionMouseLeave = (optionInfo: SelectOptionInfo) => {
    if (!optionInfo.disabled) setActiveKey();
  };

  const renderLabel = ({ data }: { data: SelectViewValue }) => {
    if (slots.label && data) {
      const optionData =
        (data.option as SelectOptionData | undefined) ??
        optionInfoMap.get(data.value as string)?.raw;
      if (optionData) {
        return slots.label({ data: optionData });
      }
    }

    return data.label ?? '';
  };

  const renderTag = ({ data }: { data: SelectViewValue }) => {
    const optionData =
      (data.option as SelectOptionData | undefined) ?? optionInfoMap.get(data.value as string)?.raw;

    if (!optionData) {
      return renderLabel({ data });
    }

    return slots.tag?.({ data: optionData }) ?? renderLabel({ data });
  };

  defineExpose({
    focus: () => selectViewRef.value?.focus?.(),
    blur: () => selectViewRef.value?.blur?.(),
  });

  // combobox 语义透传到触发器 <input>：role + 开合状态 + 自动补全 + 活动选项（aria-activedescendant）
  // 让 SR 在 input 上聚焦时能朗读方向键高亮的选项（InputLabel 经 inputAttrs 落到 input）。
  const comboboxInputAttrs = computed<Record<string, unknown>>(() => ({
    'role': 'combobox',
    'aria-expanded': computedPopupVisible.value,
    'aria-autocomplete': mergedAllowSearch.value ? 'list' : 'none',
    'aria-activedescendant': activeKey.value ? optionId(activeKey.value) : undefined,
  }));
  const triggerSlotProps = computed(() => ({
    value: triggerValue.value,
    displayValue: triggerDisplayValue.value,
    inputValue: computedInputValue.value,
    selectedOptions: triggerSelectedOptions.value,
    popupVisible: computedPopupVisible.value,
    disabled: mergedDisabled.value,
    loading: props.loading,
    multiple: props.multiple,
  }));
  const triggerBindings = computed(() => ({
    trigger: 'click' as const,
    position: 'bl' as const,
    popupOffset: 4,
    animationName: 'slide-dynamic-origin',
    hideEmpty: true,
    preventFocus: true,
    autoFitPopupWidth: true,
    autoFitTransformOrigin: true,
    ariaHasPopup: 'listbox' as const,
    disabled: mergedDisabled.value,
    popupVisible: computedPopupVisible.value,
    unmountOnClose: props.unmountOnClose,
    clickToClose: !(mergedAllowSearch.value || props.allowCreate),
    popupContainer: props.popupContainer,
    onPopupVisibleChange: handlePopupVisibleChange,
    ...props.triggerProps,
    floatingOptions: props.floatingOptions ?? props.triggerProps?.floatingOptions,
  }));
  const selectViewBindings = computed(() => ({
    modelValue: selectViewValue.value,
    inputValue: computedInputValue.value,
    multiple: props.multiple,
    disabled: mergedDisabled.value,
    error: mergedError.value,
    loading: props.loading,
    allowClear: mergedAllowClear.value,
    allowCreate: props.allowCreate,
    allowSearch: Boolean(mergedAllowSearch.value),
    showArrow: props.showArrow,
    opened: computedPopupVisible.value,
    maxTagCount: props.maxTagCount,
    placeholder: props.placeholder,
    fitWidth: props.fitWidth,
    maxWFull: props.maxWFull,
    bordered: props.bordered,
    size: mergedSize.value,
    tagNowrap: props.tagNowrap,
    inputAttrs: comboboxInputAttrs.value,
    onInputValueChange: handleInputValueChange,
    onKeydown: handleKeyDown,
    onRemove: handleRemove,
    onClear: handleClear,
    ...attrs,
    class: [prefixCls, attrs.class],
  }));
</script>
