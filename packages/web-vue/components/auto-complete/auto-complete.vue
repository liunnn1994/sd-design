<template>
  <DefineOption v-slot="{ item }">
    <li
      v-if="isGroupOptionInfo(item)"
      :key="item.key"
      role="group"
      :aria-label="item.label"
      :class="groupPrefixCls"
    >
      <div :class="`${groupPrefixCls}-title`">
        <Ellipsis>{{ item.label }}</Ellipsis>
      </div>
      <ReuseOption v-for="child in item.options" :key="child.key" :item="child" />
    </li>
    <li
      v-else
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
        <slot v-if="slots.option" name="option" :data="item" />
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
          v-for="item in validOptions as (SelectOptionInfo | SelectOptionGroupInfo)[]"
          :key="item.key"
          :item="item"
        />
        <template #virtual-list>
          <VirtualList
            ref="virtualListRef"
            v-bind="resolvedVirtualListProps"
            :items="validOptions"
            @scroll="handleDropdownScroll"
            @reach-bottom="handleDropdownReachBottom"
          >
            <template #item="{ item }">
              <ReuseOption
                :key="(item as SelectOptionInfo | SelectOptionGroupInfo).key"
                :item="item as SelectOptionInfo | SelectOptionGroupInfo"
              />
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
    SelectOptionGroupInfo,
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
  import { getKeyFromValue, isGroupOptionInfo } from '../select/utils';
  import Trigger, { type TriggerProps } from '../trigger';

  const DEFAULT_AUTOCOMPLETE_VIRTUAL_ITEM_SIZE = 36;

  defineOptions({ name: 'AutoComplete', inheritAttrs: false });

  const props = defineProps({
    /**
     * @zh 绑定值
     * @en Value of the input
     */
    modelValue: {
      type: String,
      default: undefined,
    },
    /**
     * @zh 默认值（非受控状态）
     * @en Default value (uncontrolled state)
     */
    defaultValue: {
      type: String,
      default: '',
    },
    /**
     * @zh 是否禁用
     * @en Whether the component is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否只读
     * @en Whether the component is readonly
     */
    readonly: {
      type: [Boolean, String],
      default: false,
    },
    /**
     * @zh 自动填充的可选项数据
     * @en Data of the suggestion options
     */
    data: {
      type: Array as PropType<(string | number | SelectOptionData | SelectOptionGroup)[]>,
      default: () => [],
    },
    /**
     * @zh 浮层挂载的容器
     * @en Container the popup is mounted into
     */
    popupContainer: [String, Object] as PropType<string | HTMLElement | null | undefined>,
    /**
     * @zh 是否要求完全匹配才选中
     * @en Whether only an exact match can be selected
     */
    strict: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 选项的过滤方式
     * @en How the options are filtered
     */
    filterOption: {
      type: [Boolean, Function] as PropType<FilterOption>,
      default: true,
    },
    /**
     * @zh 触发器的组件属性
     * @en Props forwarded to the trigger
     */
    triggerProps: Object as PropType<TriggerProps>,
    /**
     * @zh 浮层的定位配置
     * @en Floating options of the popup
     */
    floatingOptions: Object as PropType<FloatingOptions>,
    /**
     * @zh 是否允许清除
     * @en Whether the value can be cleared
     */
    allowClear: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 宽度是否适应内容
     * @en Whether the width adapts to the content
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
    /**
     * @zh 虚拟列表的属性，用于大数据量渲染
     * @en Props forwarded to the virtual list, used for large data sets
     */
    virtualListProps: Object as PropType<VirtualListProps>,
  });

  const emit = defineEmits<{
    'update:modelValue': [_value: string];
    /**
     * @zh 值变化时触发
     * @en Trigger when the value changes
     */
    'change': [_value: string];
    /**
     * @zh 搜索时触发
     * @en Trigger while searching
     */
    'search': [_value: string];
    /**
     * @zh 选中选项时触发
     * @en Trigger when an option is selected
     */
    'select': [_value: string];
    /**
     * @zh 点击清除按钮时触发
     * @en Trigger when the clear button is clicked
     */
    'clear': [_event: Event];
    /**
     * @zh 下拉列表滚动时触发
     * @en Trigger when the dropdown scrolls
     */
    'dropdownScroll': [_event: Event];
    /**
     * @zh 下拉列表滚动到底部时触发
     * @en Trigger when the dropdown reaches the bottom
     */
    'dropdownReachBottom': [_event: Event];
  }>();

  const attrs = useAttrs();
  const slots = useSlots();
  const [DefineOption, ReuseOption] = createReusableTemplate<{
    item: SelectOptionInfo | SelectOptionGroupInfo;
  }>();
  const prefixCls = getPrefixCls('auto-complete');
  const optionPrefixCls = getPrefixCls('select-option');
  const groupPrefixCls = getPrefixCls('select-group');
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
  watch([mergedDisabled, () => props.readonly], ([disabled, readonly]) => {
    if (disabled || readonly) innerPopupVisible.value = false;
  });
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
    if (popupVisible && (props.readonly || mergedDisabled.value)) return;
    innerPopupVisible.value = popupVisible;
  };
  const strictFilterOption = (inputValue: string, option: SelectOptionData) =>
    // 与非 strict 路径对齐：非 strict 基于归一化后的 optionInfo.label 匹配
    // （缺 label 时回退到 value 的字符串形式），strict 同样基于该归一化 label
    // 做大小写敏感匹配，避免字符串/数字或缺 label 的数据一输入就被过滤成空
    Boolean(String(option.label ?? option.value ?? '').includes(inputValue));
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
    if (props.readonly || mergedDisabled.value) return;
    const value = String(optionInfoMap.get(key)?.value ?? '');
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
      virtualListRef,
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
    popupContainer: props.popupContainer ?? undefined,
    ...props.triggerProps,
    floatingOptions: props.floatingOptions ?? props.triggerProps?.floatingOptions,
  }));

  const focus = () => inputRef.value?.focus();
  const blur = () => inputRef.value?.blur();
  defineExpose({ inputRef, focus, blur });
</script>
