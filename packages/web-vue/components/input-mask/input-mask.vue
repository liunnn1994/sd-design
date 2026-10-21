<template>
  <Input
    ref="inputComponentRef"
    v-bind="forwardedAttrs"
    :model-value="displayValue"
    :size="size"
    :allow-clear="allowClear && hasValue"
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

  import { createInputMaskFoundation } from '@sdata/web-core/input-mask/foundation';

  import type { InputInstance } from '../input';
  import type { InputMaskProps, InputMaskSelection } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import Input from '../input';
  import { useI18n } from '../locale';
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
    /**
     * @zh 绑定值变化
     * @en Value update
     */
    'update:modelValue': [value: string];
    /**
     * @zh 用户输入时触发
     * @en Triggered on user input
     */
    'input': [value: string, event: Event];
    /**
     * @zh 失焦或按下回车且值变化时触发
     * @en Triggered after blur or Enter when changed
     */
    'change': [value: string, event: Event];
    /**
     * @zh 固定位置掩码全部填写时触发
     * @en Triggered when a fixed mask is completely filled
     */
    'complete': [value: string];
    /**
     * @zh 用户按下回车时触发
     * @en Triggered on Enter
     */
    'pressEnter': [event: KeyboardEvent];
    /**
     * @zh 用户点击清除按钮时触发
     * @en Triggered when clear is clicked
     */
    'clear': [event: MouseEvent];
    /**
     * @zh 输入框获得焦点时触发
     * @en Triggered on focus
     */
    'focus': [event: FocusEvent];
    /**
     * @zh 输入框失去焦点时触发
     * @en Triggered on blur
     */
    'blur': [event: FocusEvent];
  }>();

  defineSlots<{
    /**
     * @zh 输入框内前缀
     * @en Inner prefix
     */
    prefix?: () => unknown;
    /**
     * @zh 输入框内后缀
     * @en Inner suffix
     */
    suffix?: () => unknown;
    /**
     * @zh 输入框外前置标签
     * @en Outer prepend label
     */
    prepend?: () => unknown;
    /**
     * @zh 输入框外后置标签
     * @en Outer append label
     */
    append?: () => unknown;
  }>();

  const attrs = useAttrs();
  const prefixCls = getPrefixCls('input-mask');
  const inputComponentRef = ref<InputInstance>();
  const focused = ref(false);
  const lastSelection = ref<InputMaskSelection | null>(null);
  const complete = ref(false);

  const foundation: ReturnType<typeof createInputMaskFoundation> = createInputMaskFoundation(
    {
      props,
      presets: inputMaskPresets,
      get inputElement() {
        return inputComponentRef.value?.inputRef as HTMLInputElement | undefined;
      },
      get focused() {
        return focused.value;
      },
      set focused(value) {
        focused.value = value;
      },
      get lastSelection() {
        return lastSelection.value;
      },
      set lastSelection(value) {
        lastSelection.value = value;
      },
      get complete() {
        return complete.value;
      },
      set complete(value) {
        complete.value = value;
      },
      get innerValue() {
        return innerValue.value;
      },
      set innerValue(value) {
        innerValue.value = value;
      },
      get presetDefinition() {
        return presetDefinition.value;
      },
      get effectiveMask() {
        return effectiveMask.value;
      },
      get effectiveFormatChars() {
        return effectiveFormatChars.value;
      },
      get effectiveMaskChar() {
        return effectiveMaskChar.value;
      },
      get hasValue() {
        return hasValue.value;
      },
    },
    {
      update: (value) => emit('update:modelValue', value),
      complete: (value) => emit('complete', value),
      input: (value, event) => emit('input', value, event),
      change: (value, event) => emit('change', value, event),
      pressEnter: (event) => emit('pressEnter', event),
      clear: (event) => emit('clear', event),
      focus: (event) => emit('focus', event),
      blur: (event) => emit('blur', event),
      afterRender: (task) => {
        void nextTick(task);
      },
    },
  );
  const {
    getInputElement,
    handleModelUpdate,
    handleInput,
    handleChange,
    handlePressEnter,
    handleClear,
    handleFocus,
    handleBlur,
  } = foundation;
  const presetDefinition = computed(foundation.getPresetDefinition);
  const effectiveMask = computed(foundation.getEffectiveMask);
  const effectiveFormatChars = computed(foundation.getEffectiveFormatChars);
  const effectiveMaskChar = computed(foundation.getEffectiveMaskChar);
  // A fixed mask or preset manages its own length, so Input's maxLength/showWordLimit
  // would truncate the raw value mid-format and break masking. Ignore them in that case.
  const lengthManaged = computed(foundation.getLengthManaged);

  const innerValue = ref('');
  foundation.initialize();

  const displayValue = computed(foundation.getDisplayValue);

  const { t } = useI18n();

  const mergedPlaceholder = computed(
    () =>
      props.placeholder ??
      (props.preset === 'ip' ? t('inputMask.ipPlaceholder') : presetDefinition.value?.placeholder),
  );
  const mergedInputAttrs = computed(foundation.getMergedInputAttrs);
  const forwardedAttrs = computed(() => ({
    ...attrs,
    class: [prefixCls, attrs.class],
  }));

  const hasValue = computed(foundation.getHasValue);

  onMounted(foundation.mount);
  onBeforeUnmount(foundation.dispose);

  watch(() => props.modelValue, foundation.syncModel);
  watch(
    [effectiveMask, presetDefinition, effectiveMaskChar, effectiveFormatChars],
    foundation.syncMask,
  );

  defineExpose({
    get inputRef() {
      return getInputElement();
    },
    focus: () => inputComponentRef.value?.focus(),
    blur: () => inputComponentRef.value?.blur(),
  });
</script>
