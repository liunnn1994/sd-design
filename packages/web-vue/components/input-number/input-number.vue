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
      'aria-valuenow': innerValue,
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

  type StepMethods = 'minus' | 'plus';
  type InputNumberValue = string | number | null | undefined;
  type InputNumberValueMode = 'string' | 'number';
  type InputNumberFormatter = {
    bivarianceHack(value: InputNumberValue): string | undefined;
  }['bivarianceHack'];

  const FIRST_DELAY = 800;
  const SPEED = 150;
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
    typeof (props.modelValue ?? props.defaultValue) === 'string' ? 'string' : 'number',
  );
  const mergedPrecision = computed(() => {
    if (isNumber(props.precision)) {
      const decimal = `${props.step}`.split('.')[1];
      return Math.max(decimal?.length || 0, props.precision);
    }
    return undefined;
  });
  const getNumberValue = (value: InputNumberValue) => {
    if (isUndefined(value) || value === null || value === '') return undefined;
    if (typeof value === 'number') return Number.isNaN(value) ? undefined : value;
    const normalizedValue = value.trim();
    if (!normalizedValue || /^[-.]$/.test(normalizedValue)) return undefined;
    const parsed = Number(props.parser?.(normalizedValue) ?? normalizedValue);
    return Number.isNaN(parsed) ? undefined : parsed;
  };
  const getStringValue = (number: number | undefined) => {
    if (!isNumber(number)) return '';
    const value = mergedPrecision.value ? number.toFixed(mergedPrecision.value) : String(number);
    return props.formatter?.(value) ?? value;
  };
  const getDisplayValue = (value: InputNumberValue) => {
    if (typeof value === 'string') {
      const normalizedValue = value.trim();
      if (!normalizedValue || /^[-.]$/.test(normalizedValue)) return value;
      const parsed = getNumberValue(value);
      return isNumber(parsed) ? getStringValue(parsed) : value;
    }
    return getStringValue(value ?? undefined);
  };
  const getModelValue = (value: number | undefined): InputNumberValue =>
    valueMode.value === 'string' ? (isUndefined(value) ? '' : String(value)) : value;

  const innerValue = ref(getDisplayValue(props.modelValue ?? props.defaultValue));
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
    if (isNumber(props.min) && value < props.min) value = props.min;
    if (isNumber(props.max) && value > props.max) value = props.max;
    return isNumber(mergedPrecision.value) ? NP.round(value, mergedPrecision.value) : value;
  };
  const updateNumberStatus = (number: number | undefined) => {
    isMin.value = isNumber(number) && number <= props.min;
    isMax.value = isNumber(number) && number >= props.max;
  };
  const handleExceedRange = () => {
    const finalValue = getLegalValue(valueNumber.value);
    const stringValue = getStringValue(finalValue);
    if (finalValue !== valueNumber.value || innerValue.value !== stringValue)
      innerValue.value = stringValue;
    emit('update:modelValue', getModelValue(finalValue));
  };
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
    const nextValue = isNumber(valueNumber.value)
      ? getLegalValue(NP[method](valueNumber.value, props.step))
      : props.min === -Infinity
        ? 0
        : props.min;
    innerValue.value = getStringValue(nextValue);
    updateNumberStatus(nextValue);
    const emittedValue = getModelValue(nextValue);
    emit('update:modelValue', emittedValue);
    emit('change', emittedValue, event);
  };
  const handleStepButton = (event: Event, method: StepMethods, needRepeat = false) => {
    event.preventDefault();
    if (props.readonly) return;
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
    if (isNumber(Number(parsedValue)) || /^[-.]$/.test(String(parsedValue))) {
      innerValue.value = props.formatter?.(parsedValue) ?? String(parsedValue);
      updateNumberStatus(valueNumber.value);
      const emittedValue = getModelValue(valueNumber.value);
      emit('input', emittedValue, innerValue.value, event);
      if (props.modelEvent === 'input') {
        emit('update:modelValue', emittedValue);
        emit('change', emittedValue, event);
      }
    }
  };
  const handleFocus = (event: FocusEvent) => emit('focus', event);
  const handleChange = (value: string, event: Event) => {
    if (event instanceof MouseEvent && !value) return;
    handleExceedRange();
    emit('change', getModelValue(valueNumber.value), event);
  };
  const handleBlur = (event: FocusEvent) => emit('blur', event);
  const handleClear = (event: Event) => {
    innerValue.value = '';
    const emittedValue = getModelValue(undefined);
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
      if (typeof value === 'string') valueMode.value = 'string';
      else if (typeof value === 'number') valueMode.value = 'number';
      const nextNumberValue = getNumberValue(value);
      if (value !== innerValue.value && nextNumberValue !== valueNumber.value) {
        innerValue.value = getDisplayValue(value);
        updateNumberStatus(nextNumberValue);
      } else if (value === '' && innerValue.value !== '') {
        innerValue.value = '';
        updateNumberStatus(undefined);
      }
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
