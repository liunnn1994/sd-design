<template>
  <div :class="prefixCls" role="group" :aria-label="t('a11y.verificationCode')">
    <template v-for="(character, index) in innerValue" :key="index">
      <SdInput
        :ref="(element) => setInputRef(element, index)"
        :type="type"
        :class="inputCls"
        :model-value="character"
        :size="size"
        :error="error"
        :disabled="disabled"
        :readonly="readonly"
        :input-attrs="{ 'aria-label': t('a11y.characterOf', index + 1, length) }"
        @focus="focusFirstEmptyInput(index)"
        @input="(value, event) => handleInput(index, value, event)"
        @keydown="handleKeydown(index, $event)"
        @paste="handlePaste($event, index)"
        @mousedown="handleCursorToEnd($event, index)"
      />
      <VNodeRenderer v-if="separator" :content="separator(index, character)" />
    </template>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    nextTick,
    ref,
    watch,
    type ComponentPublicInstance,
    type PropType,
    type VNode,
    type VNodeChild,
  } from 'vue';

  import type { Size } from '../_utils/constant';

  import { getPrefixCls } from '../_utils/global-config';
  import { isExist, isFunction, isString, isUndefined } from '../_utils/is';
  import { ArrowLeft, ArrowRight, Backspace } from '../_utils/keycode';
  import SdInput from '../input';
  import { useI18n } from '../locale';

  defineOptions({
    name: 'VerificationCode',
  });

  const props = defineProps({
    /** @zh 绑定值 @en Value */
    modelValue: String,
    /** @zh 默认值（非受控状态） @en Default value (uncontrolled state) */
    defaultValue: {
      type: String,
      default: '',
    },
    /** @zh 验证码的长度，根据长度渲染对应个数的输入框 @en Verification code length */
    length: {
      type: Number,
      default: 6,
    },
    /** @zh 输入框大小 @en Input size */
    size: String as PropType<Size>,
    /** @zh 是否禁用 @en Whether to disable */
    disabled: Boolean,
    /** @zh 是否密码模式 @en Password mode */
    masked: Boolean,
    /** @zh 只读 @en Readonly */
    readonly: { type: [Boolean, String], default: false },
    /** @zh 是否为错误状态 @en Whether it is an error state */
    error: {
      type: Boolean,
      default: false,
    },
    /** @zh 分隔符 @en Separator */
    separator: {
      type: Function as PropType<(index: number, character: string) => VNode>,
    },
    /** @zh 格式化函数 @en Formatter */
    formatter: {
      type: Function as PropType<
        (inputValue: string, index: number, value: string) => string | boolean
      >,
    },
  });

  const emit = defineEmits({
    'update:modelValue': (_value: string) => true,
    'change': (_value: string) => true,
    'finish': (_value: string) => true,
    'input': (_inputValue: string, _index: number, _event: Event) => true,
  });

  type FocusableInput = ComponentPublicInstance & {
    focus: () => void;
    blur: () => void;
    inputRef: HTMLInputElement | null;
  };

  const { t } = useI18n();
  const prefixCls = getPrefixCls('verification-code');
  const prefixInputCls = getPrefixCls('input');
  const inputRefList = ref<FocusableInput[]>([]);
  const VNodeRenderer = ({ content }: { content: VNodeChild }) => content;
  const mergedValue = computed(() => props.modelValue ?? props.defaultValue);
  const type = computed(() => (props.masked ? 'password' : 'text'));
  const inputCls = computed(() => [
    prefixInputCls,
    {
      [`${prefixInputCls}-size-${props.size}`]: props.size,
    },
  ]);
  const filledValue = computed(() => {
    const newValue = String(mergedValue.value).split('');
    return Array.from({ length: props.length }, (_, index) =>
      isExist(newValue[index]) ? String(newValue[index]) : '',
    );
  });
  const innerValue = ref(filledValue.value.slice());
  // 克隆：避免 innerValue 与 filledValue 的 computed 缓存数组同引用，
  // 否则输入的原地修改会污染缓存，受控还原时取到的是已输入的脏数组。
  // （watcher 与 keepControl 中的赋值同理。）

  watch(filledValue, (value) => {
    innerValue.value = value.slice();
  });

  function setInputRef(element: Element | ComponentPublicInstance | null, index: number) {
    if (element) {
      inputRefList.value[index] = element as FocusableInput;
    }
  }

  function updateValue() {
    const value = innerValue.value.join('').trim();
    const prevModelValue = props.modelValue;
    emit('update:modelValue', value);
    emit('change', value);
    if (value.length === props.length) {
      emit('finish', value);
    }
    focusFirstEmptyInput();
    // 受控用法（父组件传了 modelValue 却未回写 update:modelValue）时输入不留存：
    // 仿 Input 的 keepControl，在 nextTick 校验 prop 是否被写回，未写回则按 props 还原。
    nextTick(() => keepControl(prevModelValue));
  }

  function keepControl(prevModelValue: string | undefined) {
    if (props.modelValue === undefined || props.modelValue !== prevModelValue) return;
    // 注意必须克隆：innerValue 初始化时与 filledValue 的缓存数组同引用，
    // 原地修改（输入）会污染 computed 缓存，直接取值会拿到已输入的数组。
    const restored = filledValue.value.slice();
    innerValue.value = restored;
    // innerValue 还原后格子组件的 model-value prop 不变，Vue 不会重补丁其内部 input DOM，
    // 需通过 SdInput 暴露的 inputRef 手动还原 DOM。
    inputRefList.value.forEach((cell, index) => {
      const inputEl = cell?.inputRef;
      if (inputEl && inputEl.value !== restored[index]) {
        inputEl.value = restored[index];
      }
    });
  }

  function handleFocus(index: number) {
    inputRefList.value[index].focus();
  }

  function focusFirstEmptyInput(index?: number) {
    const values = innerValue.value;
    if (!isUndefined(index) && values[index]) return;
    const firstEmpty = values.findIndex((value) => !value);
    handleFocus(firstEmpty === -1 ? values.length - 1 : firstEmpty);
  }

  function handleCursorToEnd(event: MouseEvent, index: number) {
    if (!innerValue.value[index]) return;
    const target = event.target as HTMLInputElement;
    if (!target?.setSelectionRange) return;
    event.preventDefault();
    target.focus();
    const end = target.value.length;
    target.setSelectionRange(end, end);
  }

  function handlePaste(event: ClipboardEvent, index: number) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text');
    if (!text) return;

    text.split('').forEach((originalCharacter, offset) => {
      let character = originalCharacter;
      if (index + offset >= props.length) return;

      if (isFunction(props.formatter)) {
        const result = props.formatter(character, index + offset, innerValue.value.join(''));
        if (result === false) {
          index -= 1;
          return;
        }
        if (isString(result)) {
          character = result.charAt(0);
        }
      }

      innerValue.value[index + offset] = character;
    });
    updateValue();
  }

  function handleKeydown(index: number, event: KeyboardEvent) {
    const keyCode = event.code || event.key;
    if (keyCode === Backspace.code && !innerValue.value[index]) {
      event.preventDefault();
      innerValue.value[Math.max(index - 1, 0)] = '';
      updateValue();
    } else if (keyCode === ArrowLeft.code && index > 0) {
      event.preventDefault();
      handleFocus(index - 1);
    } else if (keyCode === ArrowRight.code && innerValue.value[index] && index < props.length - 1) {
      event.preventDefault();
      handleFocus(index + 1);
    }
  }

  function handleInput(index: number, value: string, event: Event) {
    const trimmed = (value || '').trim();
    let character = trimmed.charAt(trimmed.length - 1);
    emit('input', character, index, event);

    if (isFunction(props.formatter)) {
      const result = props.formatter(character, index, innerValue.value.join(''));
      if (result === false) return;
      if (isString(result)) {
        character = result.charAt(0);
      }
    }

    innerValue.value[index] = character;
    updateValue();
  }

  function focus() {
    focusFirstEmptyInput();
  }

  function blur() {
    const active = document.activeElement;
    const cell = inputRefList.value.find((cell) => cell?.inputRef === active);
    if (cell) {
      cell.blur();
    }
  }

  defineExpose({ focus, blur });
</script>
