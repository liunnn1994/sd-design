<template>
  <DefineOption v-slot="{ item }">
    <li
      :ref="(element) => setOptionRef(item.key, element)"
      :class="[
        optionPrefixCls,
        {
          [`${optionPrefixCls}-active`]: activeKey === item.key,
          [`${optionPrefixCls}-disabled`]: item.disabled,
        },
      ]"
      role="option"
      :aria-disabled="item.disabled || undefined"
      @click="handleOptionClick(item, $event)"
      @mouseenter="handleOptionMouseEnter(item)"
      @mouseleave="handleOptionMouseLeave(item)"
    >
      <span :class="`${optionPrefixCls}-content`">
        <!-- item 与 optionInfoMap 中是同一对象引用（use-options.ts），直接传 item 使插槽
             data 类型为确定的 SelectOptionInfo，避免被推断为可能 undefined。 -->
        <slot v-if="slots.option && item.value" name="option" :data="item" />
        <Ellipsis v-else>{{ item.label }}</Ellipsis>
      </span>
    </li>
  </DefineOption>

  <Trigger v-bind="mergedTriggerProps" @popup-visible-change="handlePopupVisibleChange">
    <template #content>
      <SelectDropdown
        ref="dropdownRef"
        :class="`${prefixCls}-dropdown`"
        :virtual-list="Boolean(resolvedVirtualListProps)"
        @scroll="handleDropdownScroll"
        @reach-bottom="handleDropdownReachBottom"
      >
        <ReuseOption
          v-for="item in validOptions as SelectOptionInfo[]"
          :key="item.key"
          :item="item"
        />
        <template #virtual-list>
          <VirtualList ref="virtualListRef" v-bind="resolvedVirtualListProps" :items="validOptions">
            <template #item="{ item }">
              <ReuseOption :item="item as SelectOptionInfo" />
            </template>
          </VirtualList>
        </template>
        <template #footer>
          <slot name="footer" />
        </template>
      </SelectDropdown>
    </template>

    <SdInput
      ref="inputRef"
      v-bind="attrs"
      :allow-clear="mergedAllowClear"
      :model-value="computedValue"
      :disabled="mergedDisabled"
      :readonly="props.readonly"
      :fit-width="props.fitWidth"
      :max-w-full="props.maxWFull"
      :input-attrs="{
        'role': 'combobox',
        'aria-haspopup': 'listbox',
        'aria-expanded': computedPopupVisible,
        'aria-autocomplete': 'list',
      }"
      @input="handleInputValueChange"
      @clear="handleClear"
      @keydown="handleKeyDown"
    >
      <template v-if="slots.prefix" #prefix>
        <slot name="prefix" />
      </template>
      <template v-if="slots.suffix" #suffix>
        <slot name="suffix" />
      </template>
    </SdInput>
  </Trigger>
</template>

<script setup lang="ts">
  import { computed, ref, toRef, useAttrs, useSlots, watch } from 'vue';
  import type { ComponentPublicInstance, PropType } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { VirtualListProps } from '../_components/virtual-list/interface';
  import type { FloatingOptions } from '../_utils/floating';
  import type {
    FilterOption,
    SelectOptionData,
    SelectOptionGroup,
    SelectOptionInfo,
  } from '../select/interface';

  import VirtualList from '../_components/virtual-list';
  import { useAllowClear } from '../_hooks/use-allow-clear';
  import { useDropdownVirtualListProps } from '../_hooks/use-dropdown-virtual-list-props';
  import { useFormItem } from '../_hooks/use-form-item';
  import { getPrefixCls } from '../_utils/global-config';
  import { isFunction, isNull, isUndefined } from '../_utils/is';
  import { resolveDropdownVirtualListProps } from '../_utils/virtual-dropdown';
  import Ellipsis from '../ellipsis';
  import SdInput from '../input';
  import { useSelect } from '../select/hooks/use-select';
  import SelectDropdown from '../select/select-dropdown.vue';
  import { getKeyFromValue } from '../select/utils';
  import Trigger, { type TriggerProps } from '../trigger';

  const DEFAULT_AUTOCOMPLETE_VIRTUAL_ITEM_SIZE = 36;

  defineOptions({ name: 'AutoComplete', inheritAttrs: false });

  const props = defineProps({
    modelValue: {
      type: String,
      default: undefined,
    },
    defaultValue: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: [Boolean, String],
      default: false,
    },
    data: {
      type: Array as PropType<(string | number | SelectOptionData | SelectOptionGroup)[]>,
      default: () => [],
    },
    popupContainer: [String, Object] as PropType<string | HTMLElement | null | undefined>,
    strict: {
      type: Boolean,
      default: false,
    },
    filterOption: {
      type: [Boolean, Function] as PropType<FilterOption>,
      default: true,
    },
    triggerProps: Object as PropType<TriggerProps>,
    floatingOptions: Object as PropType<FloatingOptions>,
    allowClear: {
      type: Boolean,
      default: false,
    },
    fitWidth: {
      type: Boolean,
      default: false,
    },
    maxWFull: {
      type: Boolean,
      default: true,
    },
    virtualListProps: Object as PropType<VirtualListProps>,
  });

  const emit = defineEmits({
    'update:modelValue': (_value: string) => true,
    'change': (_value: string) => true,
    'search': (_value: string) => true,
    'select': (_value: string) => true,
    'clear': (_event: Event) => true,
    'dropdownScroll': (_event: Event) => true,
    'dropdownReachBottom': (_event: Event) => true,
  });

  const attrs = useAttrs();
  const slots = useSlots();
  const [DefineOption, ReuseOption] = createReusableTemplate<{ item: SelectOptionInfo }>();
  const prefixCls = getPrefixCls('auto-complete');
  const optionPrefixCls = getPrefixCls('select-option');
  const { mergedDisabled, eventHandlers } = useFormItem({
    disabled: toRef(props, 'disabled'),
  });
  const { mergedAllowClear } = useAllowClear(toRef(props, 'allowClear'));
  const innerValue = ref(props.defaultValue);
  const inputRef = ref<InstanceType<typeof SdInput>>();
  const computedValue = computed(() => props.modelValue ?? innerValue.value);

  watch(toRef(props, 'modelValue'), (value) => {
    if (isUndefined(value) || isNull(value)) innerValue.value = '';
  });

  const computedValueKeys = computed(() =>
    computedValue.value ? [getKeyFromValue(computedValue.value)] : [],
  );
  const dropdownRef = ref();
  const optionRefs = ref<Record<string, HTMLElement>>({});
  const innerPopupVisible = ref(false);
  const computedPopupVisible = computed(
    () => innerPopupVisible.value && validOptionInfos.value.length > 0,
  );
  const virtualListRef = ref();
  const { mergedDropdownVirtualListProps } = useDropdownVirtualListProps(
    computed(() => props.virtualListProps),
  );
  const component = computed(() => (mergedDropdownVirtualListProps.value ? 'div' : 'li'));
  const resolvedVirtualListProps = computed(() =>
    resolveDropdownVirtualListProps(
      mergedDropdownVirtualListProps.value,
      props.triggerProps,
      DEFAULT_AUTOCOMPLETE_VIRTUAL_ITEM_SIZE,
    ),
  );

  const handlePopupVisibleChange = (popupVisible: boolean) => {
    if (popupVisible && props.readonly) return;
    innerPopupVisible.value = popupVisible;
  };
  const strictFilterOption = (inputValue: string, option: SelectOptionData) =>
    Boolean(option.label?.includes(inputValue));
  const mergedFilterOption = computed(() => {
    if (isFunction(props.filterOption)) return props.filterOption;
    if (props.filterOption && props.strict) return strictFilterOption;
    return props.filterOption;
  });
  const handleChange = (value: string) => {
    innerValue.value = value;
    emit('update:modelValue', value);
    emit('change', value);
    eventHandlers.value?.onChange?.();
  };
  const handleClear = (event: Event) => {
    innerValue.value = '';
    emit('update:modelValue', '');
    emit('change', '');
    eventHandlers.value?.onChange?.();
    emit('clear', event);
  };
  const handleSelect = (key: string, _event: Event) => {
    const value = optionInfoMap.get(key)?.value as string;
    emit('select', value);
    handleChange(value);
    inputRef.value?.blur();
  };
  const handleInputValueChange = (value: string) => {
    emit('search', value);
    handleChange(value);
  };
  const handleDropdownScroll = (event: Event) => emit('dropdownScroll', event);
  const handleDropdownReachBottom = (event: Event) => emit('dropdownReachBottom', event);

  const { validOptions, optionInfoMap, validOptionInfos, activeKey, setActiveKey, handleKeyDown } =
    useSelect({
      options: toRef(props, 'data'),
      inputValue: computedValue,
      filterOption: mergedFilterOption,
      popupVisible: computedPopupVisible,
      valueKeys: computedValueKeys,
      component,
      dropdownRef,
      optionRefs,
      onSelect: handleSelect,
      onPopupVisibleChange: handlePopupVisibleChange,
    });

  const setOptionRef = (key: string, element: Element | ComponentPublicInstance | null) => {
    const resolved = element && '$el' in element ? (element.$el as Element | undefined) : element;
    if (resolved instanceof HTMLElement) optionRefs.value[key] = resolved;
  };
  const handleOptionClick = (item: SelectOptionInfo, event: MouseEvent) => {
    if (!item.disabled) handleSelect(item.key, event);
  };
  const handleOptionMouseEnter = (item: SelectOptionInfo) => {
    if (!item.disabled) setActiveKey(item.key);
  };
  const handleOptionMouseLeave = (item: SelectOptionInfo) => {
    if (!item.disabled) setActiveKey();
  };
  const mergedTriggerProps = computed(() => ({
    trigger: 'focus' as const,
    position: 'bl' as const,
    animationName: 'slide-dynamic-origin',
    autoFitTransformOrigin: true,
    popupVisible: computedPopupVisible.value,
    clickToClose: false,
    preventFocus: true,
    popupOffset: 4,
    disabled: mergedDisabled.value,
    autoFitPopupWidth: true,
    ...props.triggerProps,
    floatingOptions: props.floatingOptions ?? props.triggerProps?.floatingOptions,
  }));

  const focus = () => inputRef.value?.focus();
  const blur = () => inputRef.value?.blur();
  defineExpose({ inputRef, focus, blur });
</script>
