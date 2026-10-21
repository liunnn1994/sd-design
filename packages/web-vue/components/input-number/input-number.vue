<template>
  <SdInput
    :key="`__sd__${props.mode}`"
    ref="inputRef"
    :class="cls"
    type="text"
    :allow-clear="mergedAllowClear"
    :size="mergedSize"
    :model-value="innerValue"
    :placeholder="props.placeholder"
    :fit-width="props.fitWidth"
    :max-w-full="props.maxWFull"
    fit-width-fallback="2ch"
    :disabled="mergedDisabled"
    :readonly="props.readonly"
    :error="props.error"
    :input-attrs="{
      'role': 'spinbutton',
      'aria-valuemax': props.max,
      'aria-valuemin': props.min,
      'aria-valuenow': getEmittedValue() === '' ? undefined : getEmittedValue(),
      'aria-valuetext': props.formatter && !isUndefined(valueNumber) ? innerValue : undefined,
      ...props.inputAttrs,
    }"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
    @clear="handleClear"
    @change="handleChange"
    @keydown="onKeyDown"
  >
    <template
      v-if="props.mode === 'embed' ? slots.prepend : !props.hideButton || slots.prepend"
      #prepend
    >
      <slot v-if="props.mode === 'embed' || props.hideButton" name="prepend" />
      <SdButton
        v-else
        :size="mergedSize"
        :aria-label="t('a11y.decrease')"
        :class="`${prefixCls}-step-button`"
        :disabled="mergedDisabled || isMin"
        tabindex="-1"
        @mousedown="handleStepButton($event, 'minus', true)"
        @mouseup="clearRepeatTimer"
        @mouseleave="clearRepeatTimer"
      >
        <template #icon><IconMinus /></template>
      </SdButton>
    </template>

    <template v-if="slots.prefix" #prefix><slot name="prefix" /></template>

    <template
      v-if="props.mode === 'button' ? slots.suffix : !props.hideButton || slots.suffix"
      #suffix
    >
      <slot v-if="props.mode === 'button' || props.hideButton" name="suffix" />
      <template v-else-if="!props.readonly">
        <div v-if="slots.suffix" :class="`${prefixCls}-suffix`"><slot name="suffix" /></div>
        <div :class="`${prefixCls}-step`">
          <button
            :class="[
              `${prefixCls}-step-button`,
              { [`${prefixCls}-step-button-disabled`]: mergedDisabled || isMax },
            ]"
            type="button"
            tabindex="-1"
            :aria-label="t('a11y.increase')"
            :disabled="mergedDisabled || isMax"
            @mousedown="handleStepButton($event, 'plus', true)"
            @mouseup="clearRepeatTimer"
            @mouseleave="clearRepeatTimer"
          >
            <slot name="plus"><IconUp /></slot>
          </button>
          <button
            :class="[
              `${prefixCls}-step-button`,
              { [`${prefixCls}-step-button-disabled`]: mergedDisabled || isMin },
            ]"
            type="button"
            tabindex="-1"
            :aria-label="t('a11y.decrease')"
            :disabled="mergedDisabled || isMin"
            @mousedown="handleStepButton($event, 'minus', true)"
            @mouseup="clearRepeatTimer"
            @mouseleave="clearRepeatTimer"
          >
            <slot name="minus"><IconDown /></slot>
          </button>
        </div>
      </template>
    </template>

    <template
      v-if="props.mode === 'embed' ? slots.append : !props.hideButton || slots.append"
      #append
    >
      <slot v-if="props.mode === 'embed' || props.hideButton" name="append" />
      <SdButton
        v-else
        :size="mergedSize"
        :aria-label="t('a11y.increase')"
        :class="`${prefixCls}-step-button`"
        :disabled="mergedDisabled || isMax"
        tabindex="-1"
        @mousedown="handleStepButton($event, 'plus', true)"
        @mouseup="clearRepeatTimer"
        @mouseleave="clearRepeatTimer"
      >
        <template #icon><IconPlus /></template>
      </SdButton>
    </template>
  </SdInput>
</template>

<script setup lang="ts">
  import type {
    InputNumberValue,
    InputNumberPropFormatter,
  } from '@sdata/web-core/input-number/types';

  import { computed, onBeforeUnmount, ref, toRef, useSlots, watch, type PropType } from 'vue';

  import {
    createInputNumberData,
    configureInputNumberPrecision,
    getInitialInputNumberMode,
  } from '@sdata/web-core/input-number/data';
  import { createInputNumberFoundation } from '@sdata/web-core/input-number/foundation';

  import { useAllowClear } from '../_hooks/use-allow-clear';
  import { useFormItem } from '../_hooks/use-form-item';
  import { useSize } from '../_hooks/use-size';
  import { Size } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { isUndefined } from '../_utils/is';
  import SdButton from '../button';
  import IconDown from '../icon/icon-down';
  import IconMinus from '../icon/icon-minus';
  import IconPlus from '../icon/icon-plus';
  import IconUp from '../icon/icon-up';
  import SdInput from '../input';
  import { useI18n } from '../locale';

  type InputNumberFormatter = InputNumberPropFormatter;
  configureInputNumberPrecision();

  defineOptions({ name: 'InputNumber' });

  const props = defineProps({
    modelValue: [String, Number] as PropType<string | number>,
    defaultValue: [String, Number] as PropType<string | number>,
    mode: {
      type: String as PropType<'embed' | 'button'>,
      default: 'embed',
    },
    precision: Number,
    step: {
      type: Number,
      default: 1,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    error: {
      type: Boolean,
      default: false,
    },
    max: {
      type: Number,
      default: Infinity,
    },
    min: {
      type: Number,
      default: -Infinity,
    },
    formatter: Function as PropType<InputNumberFormatter>,
    parser: Function as PropType<(value: string) => string | number>,
    placeholder: String,
    fitWidth: {
      type: Boolean,
      default: false,
    },
    maxWFull: {
      type: Boolean,
      default: true,
    },
    hideButton: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 开启高精度小数支持，update:modelValue 返回 string 类型；内部不再把值转换为 Number，避免超过 2^53 丢失精度
     * @en Enables high-precision decimal support; update:modelValue emits string values. The accepted digit string is kept verbatim instead of being converted to Number, avoiding precision loss beyond Number.MAX_SAFE_INTEGER
     */
    stringMode: {
      type: Boolean,
      default: false,
    },
    size: String as PropType<Size>,
    allowClear: {
      type: Boolean,
      default: false,
    },
    modelEvent: {
      type: String as PropType<'change' | 'input'>,
      default: 'change',
    },
    readonly: {
      type: [Boolean, String],
      default: false,
    },
    inputAttrs: Object,
  });

  const emit = defineEmits<{
    'update:modelValue': [_value: InputNumberValue];
    /**
     * @zh 值变化时触发
     * @en Trigger when the value changes
     */
    'change': [_value: InputNumberValue, _event: Event];
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
    /**
     * @zh 点击清除按钮时触发
     * @en Trigger when the clear button is clicked
     */
    'clear': [_event: Event];
    /**
     * @zh 输入时触发
     * @en Trigger while typing
     */
    'input': [_value: InputNumberValue, _inputValue: string, _event: Event];
    /**
     * @zh 按下按键时触发
     * @en Trigger when a key is pressed
     */
    'keydown': [_event: KeyboardEvent];
  }>();

  const slots = useSlots();
  const { t } = useI18n();
  const prefixCls = getPrefixCls('input-number');
  const inputRef = ref<InstanceType<typeof SdInput>>();
  const {
    mergedSize: formSize,
    mergedDisabled,
    eventHandlers,
  } = useFormItem({
    size: toRef(props, 'size'),
    disabled: toRef(props, 'disabled'),
  });
  const { mergedSize } = useSize(formSize);
  const { mergedAllowClear } = useAllowClear(toRef(props, 'allowClear'));
  const valueMode = ref(getInitialInputNumberMode(props));
  const dataModel = createInputNumberData(props, {
    get precision() {
      return mergedPrecision.value;
    },
    get mode() {
      return valueMode.value;
    },
    get raw() {
      return rawText.value;
    },
  });
  const mergedPrecision = computed(dataModel.getPrecision);
  const innerValue = ref(dataModel.getDisplayValue(props.modelValue ?? props.defaultValue));
  const rawText = ref(
    dataModel.getRawText(props.modelValue ?? props.defaultValue, innerValue.value),
  );
  const valueNumber = computed(() => dataModel.getNumberValue(innerValue.value));
  const isMin = ref(dataModel.compareToBoundary(valueNumber.value, props.min) <= 0);
  const isMax = ref(dataModel.compareToBoundary(valueNumber.value, props.max) >= 0);
  const foundation = createInputNumberFoundation({
    get options() {
      return props;
    },
    data: dataModel,
    get inner() {
      return innerValue.value;
    },
    get raw() {
      return rawText.value;
    },
    get number() {
      return valueNumber.value;
    },
    get minReached() {
      return isMin.value;
    },
    get maxReached() {
      return isMax.value;
    },
    setInner: (value) => {
      innerValue.value = value;
    },
    setRaw: (value) => {
      rawText.value = value;
    },
    setMinReached: (value) => {
      isMin.value = value;
    },
    setMaxReached: (value) => {
      isMax.value = value;
    },
    setMode: (value) => {
      valueMode.value = value;
    },
    isDisabled: () => mergedDisabled.value,
    isMouseEvent: (event) => event instanceof MouseEvent,
    focus: () => inputRef.value?.focus(),
    setTimer: (callback, delay) => window.setTimeout(callback, delay),
    clearTimer: (timer) => window.clearTimeout(timer),
    dispatchRepeat: (event) => (event.target as HTMLElement).dispatchEvent(event),
    onUpdate: (value) => emit('update:modelValue', value),
    onChange: (value, event) => emit('change', value, event),
    onInput: (value, text, event) => emit('input', value, text, event),
    onBlur: (event) => emit('blur', event),
    onClear: (event) => emit('clear', event),
    onKeydown: (event) => emit('keydown', event),
    onFormChange: (event) => eventHandlers.value?.onChange?.(event),
  });
  onBeforeUnmount(foundation.clearRepeatTimer);
  watch([() => props.formatter, () => props.parser], ([formatter], [, previousParser]) =>
    foundation.syncFormatting(formatter, previousParser),
  );
  watch(() => [props.max, props.min], foundation.syncBounds);
  watch(() => props.modelValue, foundation.syncModel);
  const clearRepeatTimer = foundation.clearRepeatTimer;
  const getEmittedValue = foundation.getEmittedValue;
  const handleStepButton = foundation.handleStepButton;
  const handleInput = foundation.handleInput;
  const handleChange = foundation.handleChange;
  const handleBlur = foundation.handleBlur;
  const handleClear = foundation.handleClear;
  const onKeyDown = foundation.onKeyDown;
  const handleFocus = (event: FocusEvent) => emit('focus', event);
  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-mode-${props.mode}`,
    `${prefixCls}-size-${mergedSize.value}`,
    { [`${prefixCls}-readonly`]: props.readonly },
  ]);
  const focus = () => inputRef.value?.focus();
  const blur = () => inputRef.value?.blur();
  defineExpose({ inputRef, focus, blur });
</script>
