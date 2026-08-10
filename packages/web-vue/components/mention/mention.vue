<template>
  <DefineDropdown>
    <SelectDropdown ref="dropdownRef">
      <li
        v-for="item in validOptions as SelectOptionInfo[]"
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
          <slot
            v-if="slots.option && item.value"
            name="option"
            :data="optionInfoMap.get(item.key)"
          />
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

  import { createReusableTemplate } from '@vueuse/core';

  import type { FloatingOptions } from '../_utils/floating';
  import type { SelectOptionData, SelectOptionGroup, SelectOptionInfo } from '../select/interface';
  import type { MeasureInfo } from './interface';

  import ResizeObserver from '../_components/resize-observer.vue';
  import { useAllowClear } from '../_hooks/use-allow-clear';
  import { useFormItem } from '../_hooks/use-form-item';
  import { getPrefixCls } from '../_utils/global-config';
  import { isNull, isUndefined } from '../_utils/is';
  import SdInput from '../input';
  import { useSelect } from '../select/hooks/use-select';
  import SelectDropdown from '../select/select-dropdown.vue';
  import { getKeyFromValue } from '../select/utils';
  import SdTextarea from '../textarea';
  import { getSizeStyles } from '../textarea/utils';
  import Trigger from '../trigger';
  import { getLastMeasureIndex, getTextBeforeSelection, isValidSearch } from './utils';

  defineOptions({ name: 'Mention', inheritAttrs: false });

  const props = defineProps({
    modelValue: String,
    defaultValue: {
      type: String,
      default: '',
    },
    data: {
      type: Array as PropType<(string | number | SelectOptionData | SelectOptionGroup)[]>,
      default: () => [],
    },
    prefix: {
      type: [String, Array] as PropType<string | string[]>,
      default: '@',
    },
    split: {
      type: String,
      default: ' ',
    },
    type: {
      type: String as PropType<'input' | 'textarea'>,
      default: 'input',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: [Boolean, String],
      default: false,
    },
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
    floatingOptions: Object as PropType<FloatingOptions>,
  });

  const emit = defineEmits({
    'update:modelValue': (_value: string) => true,
    'change': (_value: string) => true,
    'search': (_value: string, _prefix: string) => true,
    'select': (_value: string | number | Record<string, any> | undefined) => true,
    'clear': (_event: Event) => true,
    'focus': (_event: FocusEvent) => true,
    'blur': (_event: FocusEvent) => true,
  });

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
  watch(toRef(props, 'modelValue'), (value) => {
    if (isUndefined(value) || isNull(value)) innerValue.value = '';
  });
  const computedValueKeys = computed(() =>
    computedValue.value ? [getKeyFromValue(computedValue.value)] : [],
  );
  const measureInfo = ref<MeasureInfo>({ measuring: false, location: -1, prefix: '', text: '' });
  const resetMeasureInfo = () => {
    measureInfo.value = { measuring: false, location: -1, prefix: '', text: '' };
  };
  const inputRef = ref<InstanceType<typeof SdInput> | InstanceType<typeof SdTextarea>>();
  const measureText = computed(() => measureInfo.value.text);
  const filterOption = ref(true);
  const innerPopupVisible = ref(false);
  const computedPopupVisible = computed(
    () =>
      innerPopupVisible.value && measureInfo.value.measuring && validOptionInfos.value.length > 0,
  );

  const handleInput = (value: string, event: Event) => {
    if (props.readonly) return;
    const text = getTextBeforeSelection(event.target as HTMLInputElement);
    const lastMeasure = getLastMeasureIndex(text, props.prefix);
    if (lastMeasure.location > -1) {
      const textAfterPrefix = text.slice(lastMeasure.location + lastMeasure.prefix.length);
      if (isValidSearch(textAfterPrefix, props.split)) {
        innerPopupVisible.value = true;
        measureInfo.value = { measuring: true, text: textAfterPrefix, ...lastMeasure };
        emit('search', textAfterPrefix, lastMeasure.prefix);
      } else if (measureInfo.value.location > -1) resetMeasureInfo();
    } else if (measureInfo.value.location > -1) resetMeasureInfo();
    innerValue.value = value;
    emit('update:modelValue', value);
    emit('change', value);
    eventHandlers.value?.onChange?.();
  };
  const handleClear = (event: Event) => {
    innerValue.value = '';
    resetMeasureInfo();
    innerPopupVisible.value = false;
    emit('update:modelValue', '');
    emit('change', '');
    eventHandlers.value?.onChange?.();
    emit('clear', event);
  };
  const handlePopupVisibleChange = (visible: boolean) => {
    innerPopupVisible.value = visible;
  };
  const handleSelect = (key: string, _event: Event) => {
    const { value } = optionInfoMap.get(key) ?? {};
    const measureStart = measureInfo.value.location;
    const measureEnd = measureStart + measureInfo.value.text.length;
    let head = innerValue.value.slice(0, measureStart);
    let tail = innerValue.value.slice(measureEnd + 1);
    head += !head || head.endsWith(props.split) || head.endsWith('\n') ? '' : props.split;
    tail =
      (!tail || tail.startsWith(props.split) || tail.startsWith('\n') ? '' : props.split) + tail;
    const nextValue = `${head}${measureInfo.value.prefix}${value}${tail}`;
    innerValue.value = nextValue;
    emit('select', value as string | number | Record<string, any> | undefined);
    emit('update:modelValue', nextValue);
    emit('change', nextValue);
    resetMeasureInfo();
    eventHandlers.value?.onChange?.();
  };

  const { validOptions, optionInfoMap, validOptionInfos, activeKey, setActiveKey, handleKeyDown } =
    useSelect({
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

  let styleDeclaration: CSSStyleDeclaration;
  const mirrorStyle = ref();
  const handleResize = () => {
    if (styleDeclaration) mirrorStyle.value = getSizeStyles(styleDeclaration);
  };
  onMounted(() => {
    const textareaElement = (inputRef.value as { textareaRef?: HTMLElement } | undefined)
      ?.textareaRef;
    if (props.type === 'textarea' && textareaElement) {
      styleDeclaration = window.getComputedStyle(textareaElement);
      mirrorStyle.value = getSizeStyles(styleDeclaration);
    }
  });
  const mirrorRef = ref<HTMLElement>();
  watch(computedPopupVisible, (visible) => {
    if (props.type === 'textarea' && visible) {
      nextTick(() => {
        const textareaElement = (inputRef.value as { textareaRef?: HTMLElement } | undefined)
          ?.textareaRef;
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
