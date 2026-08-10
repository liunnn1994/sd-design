<template>
  <DefineInput v-slot="{ hasOuter = false }">
    <span
      v-bind="hasOuter ? undefined : wrapperAttrs"
      :class="wrapperCls"
      @mousedown="handleMousedown"
    >
      <span v-if="slots.prefix" :class="`${prefixCls}-prefix`"><slot name="prefix" /></span>
      <input
        ref="inputRef"
        v-bind="mergeInputAttrs"
        :class="cls"
        :value="computedValue"
        :type="props.type"
        :placeholder="props.placeholder"
        :readonly="!!props.readonly"
        :disabled="mergedDisabled"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        @compositionstart="handleComposition"
        @compositionupdate="handleComposition"
        @compositionend="handleComposition"
      />
      <IconHover
        v-if="showClearBtn"
        :prefix="prefixCls"
        :class="`${prefixCls}-clear-btn`"
        role="button"
        tabindex="0"
        :aria-label="t('a11y.clear')"
        @click="handleClear"
        @keydown="handleClearKeydown"
      >
        <IconClose />
      </IconHover>
      <span
        v-if="slots.suffix || (Boolean(props.maxLength) && props.showWordLimit) || feedback"
        :class="[`${prefixCls}-suffix`, { [`${prefixCls}-suffix-has-feedback`]: feedback }]"
      >
        <span
          v-if="Boolean(props.maxLength) && props.showWordLimit"
          :class="`${prefixCls}-word-limit`"
        >
          {{ valueLength }}/{{ maxLength }}
        </span>
        <slot name="suffix" />
        <FeedbackIcon v-if="feedback" :type="feedback" />
      </span>
    </span>
  </DefineInput>

  <Tooltip :popup-visible="tipVisible" :content="readonlyTipText" position="top">
    <span v-if="hasOuter" v-bind="wrapperAttrs" :class="outerCls">
      <span v-if="slots.prepend || props.prepend" :class="`${prefixCls}-prepend`">
        <slot name="prepend">{{ props.prepend }}</slot>
      </span>
      <ReuseInput has-outer />
      <span v-if="slots.append || props.append" :class="`${prefixCls}-append`">
        <slot name="append">{{ props.append }}</slot>
      </span>
    </span>
    <ReuseInput v-else />
  </Tooltip>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, toRef, useAttrs, useSlots, watch } from 'vue';
  import type { PropType, StyleValue } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import FeedbackIcon from '../_components/feedback-icon.vue';
  import IconHover from '../_components/icon-hover.vue';
  import { useAllowClear } from '../_hooks/use-allow-clear';
  import { useCursor } from '../_hooks/use-cursor';
  import { useFitWidth } from '../_hooks/use-fit-width';
  import { useFormItem } from '../_hooks/use-form-item';
  import {
    isReadonlyModificationKey,
    useReadonlyTip,
    useReadonlyTipText,
  } from '../_hooks/use-readonly-tip';
  import { useSize } from '../_hooks/use-size';
  import { INPUT_EVENTS, Size } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { countGraphemes, sliceGraphemes } from '../_utils/grapheme';
  import { isFunction, isNull, isObject, isUndefined } from '../_utils/is';
  import { isActivationKey } from '../_utils/keyboard';
  import { Enter } from '../_utils/keycode';
  import { omit } from '../_utils/omit';
  import pick from '../_utils/pick';
  import IconClose from '../icon/icon-close';
  import { useI18n } from '../locale';
  import Tooltip from '../tooltip';

  defineOptions({ name: 'Input', inheritAttrs: false });

  const props = defineProps({
    modelValue: String,
    defaultValue: {
      type: String,
      default: '',
    },
    size: String as PropType<Size>,
    allowClear: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: [Boolean, String],
      default: false,
    },
    error: {
      type: Boolean,
      default: false,
    },
    placeholder: String,
    fitWidth: {
      type: Boolean,
      default: false,
    },
    maxWFull: {
      type: Boolean,
      default: true,
    },
    maxLength: {
      type: [Number, Object] as PropType<number | { length: number; errorOnly?: boolean }>,
      default: 0,
    },
    showWordLimit: {
      type: Boolean,
      default: false,
    },
    wordLength: Function as PropType<(value: string) => number>,
    wordSlice: Function as PropType<(value: string, maxLength: number) => string>,
    inputAttrs: Object,
    type: {
      type: String as PropType<'text' | 'password'>,
      default: 'text',
    },
    fitWidthFallback: {
      type: String,
      default: '4ch',
    },
    prepend: String,
    append: String,
  });

  const emit = defineEmits({
    'update:modelValue': (_value: string) => true,
    'input': (_value: string, _event: Event) => true,
    'change': (_value: string, _event: Event) => true,
    'pressEnter': (_event: KeyboardEvent) => true,
    'clear': (_event: MouseEvent) => true,
    'focus': (_event: FocusEvent) => true,
    'blur': (_event: FocusEvent) => true,
  });

  const attrs = useAttrs();
  const slots = useSlots();
  const [DefineInput, ReuseInput] = createReusableTemplate<{ hasOuter?: boolean }>();
  const { t } = useI18n();
  const prefixCls = getPrefixCls('input');
  const inputRef = ref<HTMLInputElement>();
  const {
    mergedSize: formSize,
    mergedDisabled,
    mergedError: formError,
    feedback,
    eventHandlers,
    formItemCtx,
  } = useFormItem({
    size: toRef(props, 'size'),
    disabled: toRef(props, 'disabled'),
    error: toRef(props, 'error'),
  });
  const { mergedSize } = useSize(formSize);
  const { mergedAllowClear } = useAllowClear(toRef(props, 'allowClear'));
  const [recordCursor, setCursor] = useCursor(inputRef);
  const { tipVisible, show: showReadonlyTip } = useReadonlyTip(
    toRef(props, 'readonly'),
    mergedDisabled,
  );
  const readonlyTipText = useReadonlyTipText(toRef(props, 'readonly'));
  const innerValue = ref(props.defaultValue);
  const computedValue = computed(() => props.modelValue ?? innerValue.value);
  let previousValue = computedValue.value;

  watch(toRef(props, 'modelValue'), (value) => {
    if (isUndefined(value) || isNull(value)) innerValue.value = '';
  });
  watch(computedValue, (_value, oldValue) => {
    previousValue = oldValue;
  });

  const focused = ref(false);
  const showClearBtn = computed(
    () =>
      mergedAllowClear.value &&
      !props.readonly &&
      !mergedDisabled.value &&
      Boolean(computedValue.value),
  );
  const isComposition = ref(false);
  const compositionValue = ref('');
  const fitWidthText = computed(() => {
    const value = compositionValue.value || computedValue.value;
    const displayValue = props.type === 'password' ? '•'.repeat(Array.from(value).length) : value;
    return displayValue || props.placeholder;
  });
  const { fitWidthStyle, fitWidthValue } = useFitWidth({
    fitWidth: () => props.fitWidth,
    text: fitWidthText,
    fallbackWidth: () => props.fitWidthFallback,
    target: inputRef,
  });
  const getValueLength = (value: string) =>
    isFunction(props.wordLength) ? props.wordLength(value) : countGraphemes(value);
  const valueLength = computed(() => getValueLength(computedValue.value));
  const maxLength = computed(() =>
    isObject(props.maxLength) ? props.maxLength.length : props.maxLength,
  );
  const maxLengthErrorOnly = computed(
    () => isObject(props.maxLength) && Boolean(props.maxLength.errorOnly),
  );
  const mergedError = computed(
    () =>
      formError.value ||
      Boolean(
        isObject(props.maxLength) &&
        props.maxLength.errorOnly &&
        valueLength.value > maxLength.value,
      ),
  );
  const defaultMaxLength = computed(() => Math.floor(maxLength.value / getValueLength('a')));

  const updateValue = (nextValue: string) => {
    if (
      maxLength.value &&
      !maxLengthErrorOnly.value &&
      getValueLength(nextValue) > maxLength.value
    ) {
      if (isFunction(props.wordSlice)) nextValue = props.wordSlice(nextValue, maxLength.value);
      else if (isFunction(props.wordLength)) nextValue = nextValue.slice(0, defaultMaxLength.value);
      else nextValue = sliceGraphemes(nextValue, defaultMaxLength.value);
    }
    innerValue.value = nextValue;
    emit('update:modelValue', nextValue);
  };
  const handleMousedown = (event: MouseEvent) => {
    if (inputRef.value && event.target !== inputRef.value) {
      event.preventDefault();
      inputRef.value.focus();
    }
  };
  const emitChange = (value: string, event: Event) => {
    if (value !== previousValue) {
      previousValue = value;
      emit('change', value, event);
      eventHandlers.value?.onChange?.(event);
    }
  };
  const handleFocus = (event: FocusEvent) => {
    focused.value = true;
    emit('focus', event);
    eventHandlers.value?.onFocus?.(event);
  };
  const handleBlur = (event: FocusEvent) => {
    focused.value = false;
    emitChange(computedValue.value, event);
    emit('blur', event);
    eventHandlers.value?.onBlur?.(event);
  };
  const keepControl = () => {
    recordCursor();
    nextTick(() => {
      if (inputRef.value && computedValue.value !== inputRef.value.value) {
        inputRef.value.value = computedValue.value;
        setCursor();
      }
    });
  };
  const handleComposition = (event: CompositionEvent) => {
    const { value, selectionStart, selectionEnd } = event.target as HTMLInputElement;
    if (event.type === 'compositionend') {
      isComposition.value = false;
      compositionValue.value = '';
      if (
        maxLength.value &&
        !maxLengthErrorOnly.value &&
        valueLength.value >= maxLength.value &&
        getValueLength(value) > maxLength.value &&
        selectionStart === selectionEnd
      ) {
        keepControl();
        return;
      }
      updateValue(value);
      emit('input', value, event);
      eventHandlers.value?.onInput?.(event);
      keepControl();
    } else {
      isComposition.value = true;
      compositionValue.value = computedValue.value + (event.data ?? '');
    }
  };
  const handleInput = (event: Event) => {
    const { value } = event.target as HTMLInputElement;
    if (!isComposition.value) {
      if (
        maxLength.value &&
        !maxLengthErrorOnly.value &&
        valueLength.value >= maxLength.value &&
        getValueLength(value) > maxLength.value &&
        (event as InputEvent).inputType === 'insertText'
      ) {
        keepControl();
        return;
      }
      updateValue(value);
      emit('input', value, event);
      eventHandlers.value?.onInput?.(event);
      keepControl();
    }
  };
  const handleClear = (event: MouseEvent) => {
    updateValue('');
    emitChange('', event);
    emit('clear', event);
  };
  const handleClearKeydown = (event: KeyboardEvent) => {
    if (isActivationKey(event)) {
      event.preventDefault();
      handleClear(event as unknown as MouseEvent);
    }
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (props.readonly && !mergedDisabled.value && isReadonlyModificationKey(event))
      showReadonlyTip();
    const keyCode = event.key || event.code;
    if (!isComposition.value && keyCode === Enter.key) {
      emitChange(computedValue.value, event);
      emit('pressEnter', event);
    }
  };

  const hasOuter = computed(() =>
    Boolean(slots.prepend || slots.append || props.prepend || props.append),
  );
  const outerCls = computed(() => [
    `${prefixCls}-outer`,
    `${prefixCls}-outer-size-${mergedSize.value}`,
    {
      [`${prefixCls}-outer-has-suffix`]: Boolean(slots.suffix),
      [`${prefixCls}-outer-disabled`]: mergedDisabled.value,
      [`${prefixCls}-fit-width`]: props.fitWidth,
      [`${prefixCls}-max-w-full`]: props.maxWFull,
    },
  ]);
  const wrapperCls = computed(() => [
    `${prefixCls}-wrapper`,
    {
      [`${prefixCls}-error`]: mergedError.value,
      [`${prefixCls}-disabled`]: mergedDisabled.value,
      [`${prefixCls}-focus`]: focused.value,
      [`${prefixCls}-fit-width`]: props.fitWidth,
      [`${prefixCls}-max-w-full`]: props.maxWFull,
    },
  ]);
  const cls = computed(() => [prefixCls, `${prefixCls}-size-${mergedSize.value}`]);
  const wrapperAttrs = computed(() => {
    const values = omit(attrs, INPUT_EVENTS) as Record<string, unknown>;
    return { ...values, style: [fitWidthStyle.value, values.style as StyleValue] };
  });
  const inputEventAttrs = computed(() => pick(attrs, INPUT_EVENTS));
  const mergeInputAttrs = computed(() => {
    const values: Record<string, unknown> = { ...inputEventAttrs.value, ...props.inputAttrs };
    if (formItemCtx.fieldId && values.id === undefined) values.id = formItemCtx.fieldId;
    if (mergedError.value) values['aria-invalid'] = true;
    values.style = [
      props.fitWidth
        ? { flex: `0 1 ${fitWidthValue}`, width: fitWidthValue, minWidth: 0 }
        : undefined,
      values.style as StyleValue,
    ];
    return values;
  });

  const focus = () => inputRef.value?.focus();
  const blur = () => inputRef.value?.blur();
  defineExpose({ inputRef, focus, blur });
</script>
