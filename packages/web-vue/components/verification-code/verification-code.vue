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

  type FocusableInput = ComponentPublicInstance & { focus: () => void };

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
  const innerValue = ref(filledValue.value);

  watch(mergedValue, () => {
    innerValue.value = filledValue.value;
  });

  function setInputRef(element: Element | ComponentPublicInstance | null, index: number) {
    if (element) {
      inputRefList.value[index] = element as FocusableInput;
    }
  }

  function updateValue() {
    const value = innerValue.value.join('').trim();
    emit('update:modelValue', value);
    emit('change', value);
    if (value.length === props.length) {
      emit('finish', value);
    }
    focusFirstEmptyInput();
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
    let character = (value || '').trim().charAt(value.length - 1);
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
</script>
