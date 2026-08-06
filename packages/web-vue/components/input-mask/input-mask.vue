<template>
  <Input
    ref="inputComponentRef"
    v-bind="forwardedAttrs"
    :model-value="displayValue"
    :size="size"
    :allow-clear="allowClear && Boolean(innerValue)"
    :disabled="disabled"
    :readonly="readonly"
    :error="error"
    :placeholder="mergedPlaceholder"
    :fit-width="fitWidth"
    :max-w-full="maxWFull"
    :max-length="lengthManaged ? undefined : maxLength"
    :show-word-limit="lengthManaged ? false : showWordLimit"
    :word-length="wordLength"
    :word-slice="wordSlice"
    :input-attrs="mergedInputAttrs"
    :prepend="prepend"
    :append="append"
    @update:model-value="handleModelUpdate"
    @input="handleInput"
    @change="handleChange"
    @press-enter="handlePressEnter"
    @clear="handleClear"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <template v-if="$slots.prefix" #prefix><slot name="prefix" /></template>
    <template v-if="$slots.suffix" #suffix><slot name="suffix" /></template>
    <template v-if="$slots.prepend" #prepend><slot name="prepend" /></template>
    <template v-if="$slots.append" #append><slot name="append" /></template>
  </Input>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue';

  import type { InputInstance } from '../input';
  import type {
    InputMaskPattern,
    InputMaskProps,
    InputMaskSelection,
    InputMaskState,
  } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import Input from '../input';
  import { formatInputMask, resolveDeletion } from './mask-engine';
  import { inputMaskPresets } from './presets';

  defineOptions({ name: 'InputMask', inheritAttrs: false });

  const props = withDefaults(defineProps<InputMaskProps>(), {
    defaultValue: '',
    maskChar: '_',
    alwaysShowMask: false,
    allowClear: false,
    disabled: false,
    readonly: false,
    error: false,
    fitWidth: false,
    maxWFull: true,
    showWordLimit: false,
  });

  const emit = defineEmits<{
    /** @zh 绑定值变化 @en Value update */
    'update:modelValue': [value: string];
    /** @zh 用户输入时触发 @en Triggered on user input */
    'input': [value: string, event: Event];
    /** @zh 失焦或按下回车且值变化时触发 @en Triggered after blur or Enter when changed */
    'change': [value: string, event: Event];
    /** @zh 固定位置掩码全部填写时触发 @en Triggered when a fixed mask is completely filled */
    'complete': [value: string];
    /** @zh 用户按下回车时触发 @en Triggered on Enter */
    'pressEnter': [event: KeyboardEvent];
    /** @zh 用户点击清除按钮时触发 @en Triggered when clear is clicked */
    'clear': [event: MouseEvent];
    /** @zh 输入框获得焦点时触发 @en Triggered on focus */
    'focus': [event: FocusEvent];
    /** @zh 输入框失去焦点时触发 @en Triggered on blur */
    'blur': [event: FocusEvent];
  }>();

  defineSlots<{
    /** @zh 输入框内前缀 @en Inner prefix */
    prefix?: () => unknown;
    /** @zh 输入框内后缀 @en Inner suffix */
    suffix?: () => unknown;
    /** @zh 输入框外前置标签 @en Outer prepend label */
    prepend?: () => unknown;
    /** @zh 输入框外后置标签 @en Outer append label */
    append?: () => unknown;
  }>();

  const attrs = useAttrs();
  const prefixCls = getPrefixCls('input-mask');
  const inputComponentRef = ref<InputInstance>();
  const focused = ref(false);
  const lastSelection = ref<InputMaskSelection | null>(null);
  const complete = ref(false);

  const presetDefinition = computed(() =>
    props.preset ? inputMaskPresets[props.preset] : undefined,
  );
  const effectiveMask = computed<InputMaskPattern | undefined>(
    () => props.mask ?? presetDefinition.value?.mask,
  );
  const effectiveFormatChars = computed(() => ({
    ...presetDefinition.value?.formatChars,
    ...props.formatChars,
  }));
  const effectiveMaskChar = computed(() => {
    if (props.maskChar === null) return null;
    return Array.from(props.maskChar)[0] ?? '_';
  });
  // A fixed mask or preset manages its own length, so Input's maxLength/showWordLimit
  // would truncate the raw value mid-format and break masking. Ignore them in that case.
  const lengthManaged = computed(() => Boolean(effectiveMask.value) || Boolean(props.preset));

  const normalizePresetValue = (value: string, previousValue: string) => {
    const preset = presetDefinition.value;
    if (!preset || effectiveMask.value) return value;
    const normalized = preset.normalize?.(value) ?? value;
    return preset.accepts?.(normalized) === false ? previousValue : normalized;
  };

  const applyNormalization = (value: string): { value: string; complete: boolean } => {
    if (effectiveMask.value) {
      const result = formatInputMask(value, null, effectiveMask.value, {
        maskChar: effectiveMaskChar.value,
        showMask: Boolean(value),
        formatChars: effectiveFormatChars.value,
      });
      return { value: result.value, complete: result.complete };
    }
    return { value: normalizePresetValue(value, ''), complete: false };
  };

  const normalizeStoredValue = (value: string) => applyNormalization(value).value;

  const innerValue = ref(normalizeStoredValue(props.modelValue ?? props.defaultValue));

  const displayValue = computed(() => {
    if (!effectiveMask.value) return innerValue.value;
    return formatInputMask(innerValue.value, null, effectiveMask.value, {
      maskChar: effectiveMaskChar.value,
      showMask: focused.value || props.alwaysShowMask || Boolean(innerValue.value),
      formatChars: effectiveFormatChars.value,
    }).value;
  });

  const mergedPlaceholder = computed(
    () => props.placeholder ?? presetDefinition.value?.placeholder,
  );
  const mergedInputAttrs = computed(() => {
    const result: Record<string, unknown> = { ...props.inputAttrs };
    if (result.inputmode === undefined && presetDefinition.value?.inputMode) {
      result.inputmode = presetDefinition.value.inputMode;
    }
    if (props.preset) {
      result['data-mask-preset'] = props.preset;
    }
    return result;
  });
  const forwardedAttrs = computed(() => ({
    ...attrs,
    class: [prefixCls, attrs.class],
  }));

  const getInputElement = () => inputComponentRef.value?.inputRef as HTMLInputElement | undefined;

  const syncComplete = (value: string, nextComplete: boolean) => {
    if (nextComplete && !complete.value) emit('complete', value);
    complete.value = nextComplete;
  };

  const commitValue = (rawValue: string) => {
    const input = getInputElement();
    const rawCursor = input?.selectionStart ?? rawValue.length;
    const previousState: InputMaskState = {
      value: innerValue.value,
      selection: lastSelection.value,
    };
    let nextState: InputMaskState;
    let nextComplete = false;

    if (effectiveMask.value) {
      const deletion = lastSelection.value
        ? resolveDeletion(
            innerValue.value,
            lastSelection.value,
            rawValue,
            rawCursor,
            effectiveMask.value,
            effectiveFormatChars.value,
            effectiveMaskChar.value,
          )
        : null;

      if (deletion) {
        nextState = {
          value: deletion.value,
          selection: { start: deletion.cursor, end: deletion.cursor },
        };
        nextComplete = deletion.complete;
      } else {
        const result = formatInputMask(rawValue, rawCursor, effectiveMask.value, {
          maskChar: effectiveMaskChar.value,
          showMask: focused.value || props.alwaysShowMask || Boolean(rawValue),
          formatChars: effectiveFormatChars.value,
        });
        nextState = { value: result.value, selection: result.selection };
        nextComplete = result.complete;
      }
    } else {
      const value = normalizePresetValue(rawValue, innerValue.value);
      const cursor =
        rawCursor === rawValue.length ? value.length : Math.min(rawCursor, value.length);
      nextState = { value, selection: { start: cursor, end: cursor } };
    }

    nextState = props.beforeMaskedValueChange?.(nextState, previousState) ?? nextState;
    innerValue.value = nextState.value;
    lastSelection.value = nextState.selection;
    emit('update:modelValue', nextState.value);
    syncComplete(nextState.value, nextComplete);

    nextTick(() => {
      const element = getInputElement();
      if (focused.value && element && nextState.selection) {
        element.setSelectionRange(nextState.selection.start, nextState.selection.end);
      }
    });
  };

  const handleModelUpdate = (value: string) => commitValue(value);
  const handleInput = (_value: string, event: Event) => emit('input', innerValue.value, event);
  const handleChange = (_value: string, event: Event) => emit('change', innerValue.value, event);
  const handlePressEnter = (event: KeyboardEvent) => emit('pressEnter', event);
  const handleClear = (event: MouseEvent) => emit('clear', event);
  const handleFocus = (event: FocusEvent) => {
    focused.value = true;
    emit('focus', event);
  };
  const handleBlur = (event: FocusEvent) => {
    focused.value = false;
    emit('blur', event);
  };

  // Track the real DOM selection so backspace/delete can tell where the user was
  // before the keystroke. `lastSelection` is otherwise only updated on commit,
  // which goes stale when the cursor is moved by click or arrow keys without input.
  // keyup/mouseup fire synchronously and reliably for keyboard/mouse moves; the
  // document-level `selectionchange` is a catch-all for programmatic changes.
  const trackedEvents: Array<keyof HTMLElementEventMap> = ['keyup', 'mouseup', 'select'];
  const updateSelectionFromDom = () => {
    const el = getInputElement();
    if (!el || document.activeElement !== el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== null && end !== null) {
      lastSelection.value = { start, end };
    }
  };
  onMounted(() => {
    const input = getInputElement();
    if (input) {
      trackedEvents.forEach((event) => input.addEventListener(event, updateSelectionFromDom));
    }
    document.addEventListener('selectionchange', updateSelectionFromDom);
  });
  onBeforeUnmount(() => {
    const input = getInputElement();
    if (input) {
      trackedEvents.forEach((event) => input.removeEventListener(event, updateSelectionFromDom));
    }
    document.removeEventListener('selectionchange', updateSelectionFromDom);
  });

  watch(
    () => props.modelValue,
    (value) => {
      if (value === undefined) return;
      const { value: next, complete: nextComplete } = applyNormalization(value ?? '');
      innerValue.value = next;
      // Echo the normalized value back so a parent that passed a raw string (or
      // null) stays in sync with the masked representation.
      if (next !== value) emit('update:modelValue', next);
      syncComplete(next, nextComplete);
    },
  );
  watch([effectiveMask, presetDefinition, effectiveMaskChar, effectiveFormatChars], () => {
    const { value: next, complete: nextComplete } = applyNormalization(innerValue.value);
    const changed = next !== innerValue.value;
    innerValue.value = next;
    // The component changed its own template, so propagate the re-normalized
    // value to keep v-model in sync (otherwise switching mask/preset can desync).
    if (changed) emit('update:modelValue', next);
    syncComplete(next, nextComplete);
  });

  defineExpose({
    get inputRef() {
      return getInputElement();
    },
    focus: () => inputComponentRef.value?.focus(),
    blur: () => inputComponentRef.value?.blur(),
  });
</script>
