<template>
  <SdInput
    :key="`__arco__${props.mode}`"
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
  import { computed, ref, toRef, useSlots, watch, type PropType } from 'vue';

  import NP from 'number-precision';

  import { useAllowClear } from '../_hooks/use-allow-clear';
  import { useFormItem } from '../_hooks/use-form-item';
  import { useSize } from '../_hooks/use-size';
  import { Size } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { isNumber, isUndefined } from '../_utils/is';
  import { getKeyDownHandler, KEYBOARD_KEY } from '../_utils/keyboard';
  import SdButton from '../button';
  import IconDown from '../icon/icon-down';
  import IconMinus from '../icon/icon-minus';
  import IconPlus from '../icon/icon-plus';
  import IconUp from '../icon/icon-up';
  import SdInput from '../input';
  import { useI18n } from '../locale';
  import { addDecimal } from './decimal';

  type StepMethods = 'minus' | 'plus';
  type InputNumberValue = string | number | null | undefined;
  type InputNumberValueMode = 'string' | 'number';
  type InputNumberFormatter = {
    bivarianceHack(value: InputNumberValue): string | undefined;
  }['bivarianceHack'];

  const FIRST_DELAY = 800;
  const SPEED = 150;
  // Plain decimal (no exponent). stringMode validates the raw digit string in
  // this shape instead of round-tripping through Number, which loses precision
  // beyond Number.MAX_SAFE_INTEGER.
  const DECIMAL_PATTERN = /^[-+]?(\d+(\.\d*)?|\.\d+)$/;
  NP.enableBoundaryChecking(false);

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

  const emit = defineEmits({
    'update:modelValue': (_value: InputNumberValue) => true,
    'change': (_value: InputNumberValue, _event: Event) => true,
    'focus': (_event: FocusEvent) => true,
    'blur': (_event: FocusEvent) => true,
    'clear': (_event: Event) => true,
    'input': (_value: InputNumberValue, _inputValue: string, _event: Event) => true,
    'keydown': (_event: KeyboardEvent) => true,
  });

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
  const valueMode = ref<InputNumberValueMode>(
    props.stringMode || typeof (props.modelValue ?? props.defaultValue) === 'string'
      ? 'string'
      : 'number',
  );
  const mergedPrecision = computed(() => {
    if (isNumber(props.precision)) {
      return Math.max(NP.digitLength(props.step), props.precision);
    }
    return undefined;
  });
  const getNumberValue = (value: InputNumberValue) => {
    if (isUndefined(value) || value === null || value === '') return undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    const normalizedValue = value.trim();
    if (!normalizedValue || /^[-.]$/.test(normalizedValue)) return undefined;
    const parsed = Number(props.parser?.(normalizedValue) ?? normalizedValue);
    // Strict numeric mode: NaN, Infinity and empty-string results are not values.
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const toPlainString = (number: number | undefined) => {
    if (!isNumber(number)) return '';
    const precision = mergedPrecision.value;
    if (!precision) return String(number);
    const displayPrecision =
      number === props.min || number === props.max
        ? Math.max(precision, NP.digitLength(number))
        : precision;
    return number.toFixed(displayPrecision);
  };
  const getStringValue = (number: number | undefined) => {
    const value = toPlainString(number);
    return props.formatter?.(value) ?? value;
  };
  const getDisplayValue = (value: InputNumberValue) => {
    if (typeof value === 'string') {
      const normalizedValue = value.trim();
      if (!normalizedValue || /^[-.]$/.test(normalizedValue)) return value;
      // stringMode keeps canonical decimal strings verbatim so values beyond
      // Number's safe range never round-trip through Number.
      if (props.stringMode && DECIMAL_PATTERN.test(normalizedValue)) return normalizedValue;
      const parsed = getNumberValue(value);
      return isNumber(parsed) ? getStringValue(parsed) : '';
    }
    // 非有限数值（Infinity 等）不作为值显示
    if (typeof value === 'number' && !Number.isFinite(value)) return '';
    return getStringValue(value ?? undefined);
  };
  const getModelValue = (value: number | undefined): InputNumberValue =>
    valueMode.value === 'string' ? (isUndefined(value) ? '' : String(value)) : value;

  const innerValue = ref(getDisplayValue(props.modelValue ?? props.defaultValue));
  // The last accepted raw text (post-parser, pre-formatter). In stringMode this
  // is the precision-preserving source of truth for emitted values.
  const rawText = ref(DECIMAL_PATTERN.test(innerValue.value) ? innerValue.value : '');
  const valueNumber = computed(() => getNumberValue(innerValue.value));
  const isMin = ref(isNumber(valueNumber.value) && valueNumber.value <= props.min);
  const isMax = ref(isNumber(valueNumber.value) && valueNumber.value >= props.max);
  let repeatTimer = 0;
  const clearRepeatTimer = () => {
    if (repeatTimer) {
      window.clearTimeout(repeatTimer);
      repeatTimer = 0;
    }
  };
  const getLegalValue = (value: number | undefined) => {
    if (isUndefined(value)) return undefined;
    if (isNumber(mergedPrecision.value)) value = NP.round(value, mergedPrecision.value);
    if (isNumber(props.min) && value < props.min) value = props.min;
    if (isNumber(props.max) && value > props.max) value = props.max;
    return value;
  };
  const updateNumberStatus = (number: number | undefined) => {
    isMin.value = isNumber(number) && number <= props.min;
    isMax.value = isNumber(number) && number >= props.max;
  };
  const handleExceedRange = (): InputNumberValue => {
    const finalValue = getLegalValue(valueNumber.value);
    const clamped = finalValue !== valueNumber.value;
    // In stringMode a valid raw digit string is authoritative: keep it verbatim
    // so the display/emit is not rewritten through Number.
    const keepRaw = props.stringMode && !clamped && DECIMAL_PATTERN.test(rawText.value);
    if (!keepRaw) {
      const stringValue = getStringValue(finalValue);
      if (clamped || innerValue.value !== stringValue) innerValue.value = stringValue;
      rawText.value = isNumber(finalValue) ? toPlainString(finalValue) : '';
    }
    updateNumberStatus(finalValue);
    const emitted = keepRaw ? rawText.value : getModelValue(finalValue);
    committedValue = emitted;
    emit('update:modelValue', emitted);
    return emitted;
  };
  watch([() => props.formatter, () => props.parser], ([formatter], [, previousParser]) => {
    const rawValue = DECIMAL_PATTERN.test(rawText.value)
      ? rawText.value
      : (previousParser?.(innerValue.value) ?? innerValue.value);
    rawText.value = String(rawValue);
    innerValue.value = formatter?.(rawValue) ?? rawText.value;
    updateNumberStatus(valueNumber.value);
  });
  watch(
    () => [props.max, props.min],
    () => {
      handleExceedRange();
      updateNumberStatus(valueNumber.value);
    },
  );
  const nextStep = (method: StepMethods, event: Event) => {
    if (
      mergedDisabled.value ||
      (method === 'plus' && isMax.value) ||
      (method === 'minus' && isMin.value)
    )
      return;
    const steppedText =
      props.stringMode && DECIMAL_PATTERN.test(rawText.value) && Number.isFinite(props.step)
        ? addDecimal(rawText.value, props.step, method === 'minus')
        : undefined;
    const nextValue = isNumber(valueNumber.value)
      ? getLegalValue(
          steppedText === undefined
            ? NP[method](valueNumber.value, props.step)
            : Number(steppedText),
        )
      : getLegalValue(props.min === -Infinity ? 0 : props.min);
    const keepSteppedText = steppedText !== undefined && Number(steppedText) === nextValue;
    rawText.value = keepSteppedText ? steppedText : toPlainString(nextValue);
    innerValue.value = keepSteppedText
      ? (props.formatter?.(rawText.value) ?? rawText.value)
      : getStringValue(nextValue);
    updateNumberStatus(nextValue);
    const emittedValue = keepSteppedText ? rawText.value : getModelValue(nextValue);
    committedValue = emittedValue;
    emit('update:modelValue', emittedValue);
    emit('change', emittedValue, event);
  };
  const handleStepButton = (event: Event, method: StepMethods, needRepeat = false) => {
    event.preventDefault();
    if (props.readonly) return;
    // Mirror nextStep's guard before focusing so a disabled/boundary button
    // never steals focus from wherever the user currently is.
    if (
      mergedDisabled.value ||
      (method === 'plus' && isMax.value) ||
      (method === 'minus' && isMin.value)
    )
      return;
    inputRef.value?.focus();
    nextStep(method, event);
    if (needRepeat) {
      repeatTimer = window.setTimeout(
        () => (event.target as HTMLElement).dispatchEvent(event),
        repeatTimer ? SPEED : FIRST_DELAY,
      );
    }
  };
  const handleInput = (value: string, event: Event) => {
    const normalizedValue = value.trim().replace(/。/g, '.');
    const parsedValue = props.parser?.(normalizedValue) ?? normalizedValue;
    if (
      parsedValue === '' ||
      Number.isFinite(Number(parsedValue)) ||
      /^[-.]$/.test(String(parsedValue))
    ) {
      rawText.value = String(parsedValue);
      innerValue.value = props.formatter?.(parsedValue) ?? String(parsedValue);
      updateNumberStatus(valueNumber.value);
      const emittedValue = getEmittedValue();
      emit('input', emittedValue, innerValue.value, event);
      if (props.modelEvent === 'input') {
        committedValue = emittedValue;
        emit('update:modelValue', emittedValue);
        emit('change', emittedValue, event);
      }
    }
    // Non-numeric text is rejected outright; the underlying SdInput's
    // keepControl restores the DOM to innerValue on the next tick, so the
    // invalid text never lingers in the input.
  };
  const getEmittedValue = (): InputNumberValue => {
    // In stringMode the accepted raw digit string is emitted as-is so typed
    // high-precision decimals survive the Number round-trip.
    if (props.stringMode && DECIMAL_PATTERN.test(rawText.value)) return rawText.value;
    return getModelValue(valueNumber.value);
  };
  let committedValue = getEmittedValue();
  const handleFocus = (event: FocusEvent) => emit('focus', event);
  const handleChange = (value: string, event: Event) => {
    if (event instanceof MouseEvent && !value) return;
    const previousValue = committedValue;
    const emitted = handleExceedRange();
    if (emitted !== previousValue) emit('change', emitted, event);
  };
  const handleBlur = (event: FocusEvent) => {
    if (getEmittedValue() !== committedValue) handleChange(innerValue.value, event);
    emit('blur', event);
  };
  const handleClear = (event: Event) => {
    innerValue.value = '';
    rawText.value = '';
    updateNumberStatus(undefined);
    const emittedValue = getModelValue(undefined);
    committedValue = emittedValue;
    emit('update:modelValue', emittedValue);
    emit('change', emittedValue, event);
    eventHandlers.value?.onChange?.(event);
    emit('clear', event);
  };
  const keyDownHandler = getKeyDownHandler(
    new Map([
      [
        KEYBOARD_KEY.ARROW_UP,
        (event: Event) => {
          event.preventDefault();
          if (!props.readonly) nextStep('plus', event);
        },
      ],
      [
        KEYBOARD_KEY.ARROW_DOWN,
        (event: Event) => {
          event.preventDefault();
          if (!props.readonly) nextStep('minus', event);
        },
      ],
    ]),
  );
  const onKeyDown = (event: KeyboardEvent) => {
    emit('keydown', event);
    if (!event.defaultPrevented) keyDownHandler(event);
  };
  watch(
    () => props.modelValue,
    (value: InputNumberValue) => {
      if (props.stringMode) {
        valueMode.value = 'string';
      } else if (typeof value === 'string') {
        valueMode.value = 'string';
      } else if (typeof value === 'number') {
        valueMode.value = 'number';
      }
      const nextNumberValue = getNumberValue(value);
      if (
        value !== innerValue.value &&
        (props.stringMode || nextNumberValue !== valueNumber.value)
      ) {
        innerValue.value = getDisplayValue(value);
        rawText.value = DECIMAL_PATTERN.test(innerValue.value) ? innerValue.value : '';
        updateNumberStatus(nextNumberValue);
      } else if (value === '' && innerValue.value !== '') {
        innerValue.value = '';
        rawText.value = '';
        updateNumberStatus(undefined);
      }
      committedValue = getEmittedValue();
    },
  );
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
