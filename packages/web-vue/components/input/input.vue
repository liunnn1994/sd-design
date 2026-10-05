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
  import {
    computed,
    nextTick,
    onBeforeUpdate,
    reactive,
    ref,
    toRef,
    useAttrs,
    useSlots,
    watch,
  } from 'vue';
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
    /**
     * @zh 绑定值
     * @en Value of the input
     * @vModel
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
     * @zh 输入框尺寸
     * @en Size of the input
     */
    size: String as PropType<Size>,
    /**
     * @zh 是否允许清除
     * @en Whether to allow clearing
     */
    allowClear: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否禁用
     * @en Whether the input is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否只读
     * @en Whether the input is readonly
     */
    readonly: {
      type: [Boolean, String],
      default: false,
    },
    /**
     * @zh 是否为错误状态
     * @en Whether the input is in error state
     */
    error: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 占位符
     * @en Placeholder of the input
     */
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
    /**
     * @zh 最大长度。传入对象时可配置 `length` 与 `errorOnly`（仅超出时提示）
     * @en Maximum length. Accepts an object with `length` and `errorOnly`
     */
    maxLength: {
      type: [Number, Object] as PropType<number | { length: number; errorOnly?: boolean }>,
      default: 0,
    },
    /**
     * @zh 是否显示字数统计
     * @en Whether to show the word count
     */
    showWordLimit: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 自定义字数统计方法
     * @en Custom function used to count words
     */
    wordLength: Function as PropType<(value: string) => number>,
    /**
     * @zh 自定义超长文本的截断方法
     * @en Custom function used to slice overlong text
     */
    wordSlice: Function as PropType<(value: string, maxLength: number) => string>,
    /**
     * @zh 透传给原生 `input` 的属性
     * @en Attributes forwarded to the native `input`
     */
    inputAttrs: Object,
    /**
     * @zh 输入框类型
     * @en Type of the input
     * @values text, password
     */
    type: {
      type: String as PropType<'text' | 'password'>,
      default: 'text',
    },
    /**
     * @zh 适应宽度时使用的兜底宽度
     * @en Fallback width used when fitting to content
     */
    fitWidthFallback: {
      type: String,
      default: '4ch',
    },
    /**
     * @zh 前缀内容
     * @en Content prepended to the input
     */
    prepend: String,
    /**
     * @zh 后缀内容
     * @en Content appended to the input
     */
    append: String,
  });

  const emit = defineEmits<{
    'update:modelValue': [_value: string];
    /**
     * @zh 输入时触发
     * @en Trigger while typing
     */
    'input': [_value: string, _event: Event];
    /**
     * @zh 值变化时触发
     * @en Trigger when the value changes
     */
    'change': [_value: string, _event: Event];
    /**
     * @zh 按下回车键时触发
     * @en Trigger when Enter is pressed
     */
    'pressEnter': [_event: KeyboardEvent];
    /**
     * @zh 点击清除按钮时触发
     * @en Trigger when the clear button is clicked
     */
    'clear': [_event: MouseEvent];
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
  const slotPresence = reactive({
    prepend: Boolean(slots.prepend),
    append: Boolean(slots.append),
    suffix: Boolean(slots.suffix),
  });
  onBeforeUpdate(() => {
    slotPresence.prepend = Boolean(slots.prepend);
    slotPresence.append = Boolean(slots.append);
    slotPresence.suffix = Boolean(slots.suffix);
  });
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
    return nextValue;
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
    previousValue = computedValue.value;
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
      const nextValue = updateValue(value);
      emit('input', nextValue, event);
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
      const nextValue = updateValue(value);
      emit('input', nextValue, event);
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
    Boolean(slotPresence.prepend || slotPresence.append || props.prepend || props.append),
  );
  const outerCls = computed(() => [
    `${prefixCls}-outer`,
    `${prefixCls}-outer-size-${mergedSize.value}`,
    {
      [`${prefixCls}-outer-has-suffix`]: slotPresence.suffix,
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
