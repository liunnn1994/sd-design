<template>
  <DefineDropdown>
    <SelectDropdown ref="dropdownRef">
      <li
        v-for="item in validOptionInfos"
        :key="item.key"
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
          <slot v-if="slots.option" name="option" :data="optionInfoMap.get(item.key)" />
          <template v-else>{{ item.label }}</template>
        </span>
      </li>
    </SelectDropdown>
  </DefineDropdown>

  <div
    v-if="props.type === 'textarea'"
    :class="[
      prefixCls,
      {
        [`${prefixCls}-fit-width`]: props.fitWidth,
        [`${prefixCls}-max-w-full`]: props.maxWFull,
      },
    ]"
  >
    <ResizeObserver @resize="handleResize">
      <SdTextarea
        ref="inputRef"
        v-bind="attrs"
        :allow-clear="mergedAllowClear"
        :model-value="computedValue"
        :disabled="mergedDisabled"
        :readonly="props.readonly"
        :fit-width="props.fitWidth"
        :max-w-full="props.maxWFull"
        @input="handleInput"
        @clear="handleClear"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="handleKeyDown"
      />
    </ResizeObserver>
    <div
      v-if="measureInfo.measuring && validOptionInfos.length > 0"
      ref="mirrorRef"
      :style="mirrorStyle"
      :class="`${prefixCls}-measure`"
    >
      {{ computedValue?.slice(0, measureInfo.location) }}
      <Trigger
        trigger="focus"
        position="bl"
        :popup-offset="4"
        :prevent-focus="true"
        :popup-visible="computedPopupVisible"
        :click-to-close="false"
        :floating-options="props.floatingOptions"
        @popup-visible-change="handlePopupVisibleChange"
      >
        <template #content><ReuseDropdown /></template>
        <span>@</span>
      </Trigger>
    </div>
  </div>

  <Trigger
    v-else
    trigger="focus"
    position="bl"
    animation-name="slide-dynamic-origin"
    :popup-offset="4"
    :prevent-focus="true"
    :popup-visible="computedPopupVisible"
    :click-to-close="false"
    :floating-options="props.floatingOptions"
    auto-fit-popup-width
    auto-fit-transform-origin
    :disabled="mergedDisabled"
    @popup-visible-change="handlePopupVisibleChange"
  >
    <template #content><ReuseDropdown /></template>
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
      @input="handleInput"
      @clear="handleClear"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="handleKeyDown"
    >
      <template v-if="slots.prefix" #prefix><slot name="prefix" /></template>
      <template v-if="slots.suffix" #suffix><slot name="suffix" /></template>
    </SdInput>
  </Trigger>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, ref, toRef, useAttrs, useSlots, watch } from 'vue';
  import type { ComponentPublicInstance, PropType } from 'vue';

  import { createMention, getEmptyMeasureInfo } from '@sdata/web-core/mention/foundation';
  import { createReusableTemplate } from '@vueuse/core';

  import type { FloatingOptions } from '../_utils/floating';
  import type {
    FilterOption,
    SelectOptionData,
    SelectOptionGroup,
    SelectOptionInfo,
  } from '../select/interface';
  import type { MeasureInfo } from './interface';

  import ResizeObserver from '../_components/resize-observer.vue';
  import { useAllowClear } from '../_hooks/use-allow-clear';
  import { useFormItem } from '../_hooks/use-form-item';
  import { getPrefixCls } from '../_utils/global-config';
  import SdInput from '../input';
  import { useSelect } from '../select/hooks/use-select';
  import SelectDropdown from '../select/select-dropdown.vue';
  import { getKeyFromValue } from '../select/utils';
  import SdTextarea from '../textarea';
  import { getSizeStyles } from '../textarea/utils';
  import Trigger from '../trigger';

  defineOptions({ name: 'Mention', inheritAttrs: false });

  const props = defineProps({
    /**
     * @zh 绑定值
     * @en Value of the text
     */
    modelValue: String,
    /**
     * @zh 默认值（非受控状态）
     * @en Default value (uncontrolled state)
     */
    defaultValue: {
      type: String,
      default: '',
    },
    /**
     * @zh 提及的可选项数据
     * @en Data of the mention options
     */
    data: {
      type: Array as PropType<(string | number | SelectOptionData | SelectOptionGroup)[]>,
      default: () => [],
    },
    /**
     * @zh 触发提及的前缀符
     * @en Prefix that triggers the mention popup
     */
    prefix: {
      type: [String, Array] as PropType<string | string[]>,
      default: '@',
    },
    /**
     * @zh 搜索关键字的分隔符
     * @en Separator that ends the search keyword
     */
    split: {
      type: String,
      default: ' ',
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
     * @zh 输入框类型
     * @en Type of the inner input
     */
    type: {
      type: String as PropType<'input' | 'textarea'>,
      default: 'input',
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
     * @zh 浮层的定位配置
     * @en Floating options of the popup
     */
    floatingOptions: Object as PropType<FloatingOptions>,
  });

  const emit = defineEmits<{
    'update:modelValue': [_value: string];
    /**
     * @zh 值变化时触发
     * @en Trigger when the value changes
     */
    'change': [_value: string];
    /**
     * @zh 搜索提及项时触发
     * @en Trigger while searching mentions
     */
    'search': [_value: string, _prefix: string];
    /**
     * @zh 选中提及项时触发
     * @en Trigger when a mention is selected
     */
    'select': [_value: string | number | Record<string, unknown> | undefined];
    /**
     * @zh 点击清除按钮时触发
     * @en Trigger when the clear button is clicked
     */
    'clear': [_event: Event];
    /**
     * @zh 获得焦点时触发
     * @en Trigger when the input gains focus
     */
    'focus': [_event: FocusEvent];
    /**
     * @zh 失去焦点时触发
     * @en Trigger when the input loses focus
     */
    'blur': [_event: FocusEvent];
  }>();

  const attrs = useAttrs();
  const slots = useSlots();
  const [DefineDropdown, ReuseDropdown] = createReusableTemplate();
  const prefixCls = getPrefixCls('mention');
  const optionPrefixCls = getPrefixCls('select-option');
  const { mergedAllowClear } = useAllowClear(toRef(props, 'allowClear'));
  const { mergedDisabled, eventHandlers } = useFormItem({
    disabled: toRef(props, 'disabled'),
  });
  const dropdownRef = ref();
  const optionRefs = ref<Record<string, HTMLElement>>({});
  const innerValue = ref(props.defaultValue);
  const computedValue = computed(() => props.modelValue ?? innerValue.value);
  const computedValueKeys = computed(() =>
    computedValue.value ? [getKeyFromValue(computedValue.value)] : [],
  );
  const measureInfo = ref<MeasureInfo>(getEmptyMeasureInfo());
  const inputRef = ref<InstanceType<typeof SdInput> | InstanceType<typeof SdTextarea>>();
  const measureText = computed(() => measureInfo.value.text);
  const filterOption = toRef(props, 'filterOption');
  const innerPopupVisible = ref(false);
  const computedPopupVisible = computed(
    () =>
      !mergedDisabled.value &&
      !props.readonly &&
      innerPopupVisible.value &&
      measureInfo.value.measuring &&
      validOptionInfos.value.length > 0,
  );

  const foundation = createMention({
    props,
    get value() {
      return computedValue.value;
    },
    get options() {
      return optionInfoMap;
    },
    get measure() {
      return measureInfo.value;
    },
    set measure(value) {
      measureInfo.value = value;
    },
    setInner(value) {
      innerValue.value = value;
    },
    setPopup(value) {
      innerPopupVisible.value = value;
    },
    onSearch: (value, prefix) => emit('search', value, prefix),
    onUpdate: (value) => emit('update:modelValue', value),
    onChange: (value) => emit('change', value),
    onFormChange: () => eventHandlers.value?.onChange?.(),
    onSelect: (value) => emit('select', value),
    onClear: (event) => emit('clear', event),
  });
  watch(toRef(props, 'modelValue'), foundation.syncValue);
  const handleInput = foundation.input;
  const handleClear = foundation.clear;
  const handlePopupVisibleChange = foundation.popup;
  const handleSelect = foundation.select;

  const { optionInfoMap, validOptionInfos, activeKey, setActiveKey, handleKeyDown } = useSelect({
    options: toRef(props, 'data'),
    inputValue: measureText,
    filterOption,
    popupVisible: computedPopupVisible,
    valueKeys: computedValueKeys,
    dropdownRef,
    optionRefs,
    onSelect: handleSelect,
    onPopupVisibleChange: handlePopupVisibleChange,
    enterToOpen: false,
  });

  const setOptionRef = (key: string, element: Element | ComponentPublicInstance | null) => {
    const resolved = element && '$el' in element ? (element.$el as Element | undefined) : element;
    if (resolved instanceof HTMLElement) optionRefs.value[key] = resolved;
    else delete optionRefs.value[key];
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

  const mirrorStyle = ref();
  const syncMirrorStyles = () => {
    if (props.type === 'textarea') {
      const textareaElement = inputRef.value?.$refs.textareaRef as HTMLTextAreaElement | undefined;
      if (textareaElement) {
        mirrorStyle.value = getSizeStyles(window.getComputedStyle(textareaElement));
      }
    }
  };
  const handleResize = () => {
    syncMirrorStyles();
  };
  onMounted(() => {
    syncMirrorStyles();
  });
  watch(inputRef, syncMirrorStyles, { flush: 'post' });
  const mirrorRef = ref<HTMLElement>();
  watch(computedPopupVisible, (visible) => {
    if (props.type === 'textarea' && visible) {
      nextTick(() => {
        const textareaElement = inputRef.value?.$refs.textareaRef as
          | HTMLTextAreaElement
          | undefined;
        if (textareaElement && textareaElement.scrollTop > 0)
          mirrorRef.value?.scrollTo(0, textareaElement.scrollTop);
      });
    }
  });
  const onFocus = (event: FocusEvent) => emit('focus', event);
  const onBlur = (event: FocusEvent) => emit('blur', event);
  const focus = () => inputRef.value?.focus();
  const blur = () => inputRef.value?.blur();
  defineExpose({ inputRef, focus, blur });
</script>
