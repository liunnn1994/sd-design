<template>
  <span v-bind="wrapperAttrs" :class="cls" @mousedown="handleMousedown">
    <span v-if="$slots.prefix" :class="`${prefixCls}-prefix`">
      <slot name="prefix" />
    </span>
    <input
      ref="inputRef"
      v-bind="mergedInputAttrs"
      :class="[`${prefixCls}-input`, { [`${prefixCls}-input-hidden`]: !showInput }]"
      :value="computedInputValue"
      :readonly="!enabledInput"
      :placeholder="mergedPlaceholder"
      :disabled="mergedDisabled"
      :style="inputStyle"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="handleComposition"
      @compositionupdate="handleComposition"
      @compositionend="handleComposition"
    />
    <span :class="valueCls" :style="valueStyle">
      <Ellipsis v-if="modelValue" :style="{ width: '100%' }">
        <slot v-if="$slots.default" :data="modelValue" />
        <template v-else>{{ formatLabel() }}</template>
      </Ellipsis>
    </span>
    <span v-if="$slots.suffix" :class="`${prefixCls}-suffix`">
      <slot name="suffix" />
    </span>
  </span>
</template>

<script setup lang="ts">
  import type { StyleValue, VNode } from 'vue';
  import { computed, toRef, useAttrs } from 'vue';

  import type { Size } from '../../_utils/constant';
  import type { EmitFn } from '../../_utils/types';
  import type { SelectViewValue } from '../select-view/interface';

  import { useFitWidth } from '../../_hooks/use-fit-width';
  import { useFormItem } from '../../_hooks/use-form-item';
  import { useInput } from '../../_hooks/use-input';
  import { useSize } from '../../_hooks/use-size';
  import { INPUT_EVENTS } from '../../_utils/constant';
  import { getPrefixCls } from '../../_utils/global-config';
  import { omit } from '../../_utils/omit';
  import pick from '../../_utils/pick';
  import Ellipsis from '../../ellipsis';

  defineOptions({ name: 'InputLabel', inheritAttrs: false });

  const props = withDefaults(
    defineProps<{
      modelValue?: SelectViewValue;
      inputValue?: string;
      enabledInput?: boolean;
      formatLabel?: (data?: SelectViewValue) => string;
      placeholder?: string;
      retainInputValue?: boolean;
      disabled?: boolean;
      baseCls?: string;
      size?: Size;
      error?: boolean;
      focused?: boolean;
      uninjectFormItemContext?: boolean;
      inputAttrs?: Record<string, unknown>;
      fitWidth?: boolean;
      maxWFull?: boolean;
    }>(),
    {
      inputValue: '',
      enabledInput: false,
      retainInputValue: false,
      disabled: false,
      error: false,
      uninjectFormItemContext: false,
      fitWidth: false,
      maxWFull: true,
    },
  );
  const emit = defineEmits<{
    'update:inputValue': [value: string];
    'inputValueChange': [value: string, event: Event];
    'focus': [event: FocusEvent];
    'blur': [event: FocusEvent];
  }>();
  defineSlots<{
    default?: (props: { data: SelectViewValue }) => VNode[];
    prefix?: () => VNode[];
    suffix?: () => VNode[];
  }>();

  const attrs = useAttrs();
  const prefixCls = props.baseCls ?? getPrefixCls('input-label');
  const {
    mergedSize: formItemSize,
    mergedDisabled,
    mergedError,
    eventHandlers,
  } = useFormItem({
    size: toRef(props, 'size'),
    disabled: toRef(props, 'disabled'),
    error: toRef(props, 'error'),
    uninject: props.uninjectFormItemContext,
  });
  const { mergedSize } = useSize(formItemSize);
  const {
    inputRef,
    _focused: internalFocused,
    computedValue: computedInputValue,
    handleInput,
    handleComposition,
    handleFocus,
    handleBlur,
    handleMousedown,
  } = useInput({
    modelValue: toRef(props, 'inputValue'),
    emit: emit as EmitFn<string>,
    eventName: 'inputValueChange',
    updateEventName: 'update:inputValue',
    eventHandlers,
  });
  const mergedFocused = computed(() => props.focused ?? internalFocused.value);
  const showInput = computed(
    () => (props.enabledInput && internalFocused.value) || !props.modelValue,
  );
  const formatLabel = () =>
    props.modelValue ? (props.formatLabel?.(props.modelValue) ?? props.modelValue.label) : '';
  const mergedPlaceholder = computed(() =>
    props.enabledInput && props.modelValue ? formatLabel() : props.placeholder,
  );
  const fitWidthText = computed(
    () => computedInputValue.value || formatLabel() || props.placeholder,
  );
  const { fitWidthStyle, fitWidthValue } = useFitWidth({
    fitWidth: () => props.fitWidth,
    text: fitWidthText,
    fallbackWidth: '4ch',
    target: inputRef,
  });
  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-size-${mergedSize.value}`,
    {
      [`${prefixCls}-search`]: props.enabledInput,
      [`${prefixCls}-focus`]: mergedFocused.value,
      [`${prefixCls}-disabled`]: mergedDisabled.value,
      [`${prefixCls}-error`]: mergedError.value,
      [`${prefixCls}-fit-width`]: props.fitWidth,
      [`${prefixCls}-max-w-full`]: props.maxWFull,
    },
  ]);
  const wrapperAttrs = computed(() => {
    const filteredAttrs = omit(attrs, INPUT_EVENTS) as Record<string, unknown>;
    return {
      ...filteredAttrs,
      style: [fitWidthStyle.value, filteredAttrs.style as StyleValue],
    };
  });
  const eventInputAttrs = computed(() => pick(attrs, INPUT_EVENTS));
  const mergedInputAttrs = computed(() => ({
    ...eventInputAttrs.value,
    ...props.inputAttrs,
  }));
  const fitInputStyle = computed(() =>
    props.fitWidth
      ? {
          flex: `0 1 ${fitWidthValue}`,
          width: fitWidthValue,
          minWidth: 0,
        }
      : undefined,
  );
  const inputStyle = computed<StyleValue>(() => [
    fitInputStyle.value,
    props.inputAttrs?.style as StyleValue,
  ]);
  const valueStyle = computed(() => fitInputStyle.value);
  const valueCls = computed(() => [
    `${prefixCls}-value`,
    { [`${prefixCls}-value-hidden`]: showInput.value },
  ]);
  const focus = () => inputRef.value?.focus();
  const blur = () => inputRef.value?.blur();

  defineExpose({ inputRef, focus, blur });
</script>
