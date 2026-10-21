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

  import {
    createVerificationCode,
    getVerificationCells,
  } from '@sdata/web-core/verification-code/foundation';

  import type { Size } from '../_utils/constant';

  import { getPrefixCls } from '../_utils/global-config';
  import SdInput from '../input';
  import { useI18n } from '../locale';

  defineOptions({
    name: 'VerificationCode',
  });

  const props = defineProps({
    /**
     * @zh 绑定值
     * @en Value
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
     * @zh 验证码的长度，根据长度渲染对应个数的输入框
     * @en Verification code length
     */
    length: {
      type: Number,
      default: 6,
    },
    /**
     * @zh 输入框大小
     * @en Input size
     */
    size: String as PropType<Size>,
    /**
     * @zh 是否禁用
     * @en Whether to disable
     */
    disabled: Boolean,
    /**
     * @zh 是否密码模式
     * @en Password mode
     */
    masked: Boolean,
    /**
     * @zh 只读
     * @en Readonly
     */
    readonly: { type: [Boolean, String], default: false },
    /**
     * @zh 是否为错误状态
     * @en Whether it is an error state
     */
    error: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 分隔符
     * @en Separator
     */
    separator: {
      type: Function as PropType<(index: number, character: string) => VNode>,
    },
    /**
     * @zh 格式化函数
     * @en Formatter
     */
    formatter: {
      type: Function as PropType<
        (inputValue: string, index: number, value: string) => string | boolean
      >,
    },
  });

  const emit = defineEmits<{
    'update:modelValue': [_value: string];
    /**
     * @zh 验证码变化时触发
     * @en Trigger when the code changes
     */
    'change': [_value: string];
    /**
     * @zh 输入完成时触发
     * @en Trigger when all inputs are filled
     */
    'finish': [_value: string];
    /**
     * @zh 输入单个验证码时触发
     * @en Trigger when a single input is entered
     */
    'input': [_inputValue: string, _index: number, _event: Event];
  }>();

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
  const filledValue = computed(() => getVerificationCells(mergedValue.value, props.length));
  const innerValue = ref(filledValue.value.slice());
  const foundation = createVerificationCode({
    props,
    get filled() {
      return filledValue.value;
    },
    get cells() {
      return inputRefList.value;
    },
    get activeElement() {
      return document.activeElement;
    },
    get inner() {
      return innerValue.value;
    },
    set inner(value) {
      innerValue.value = value;
    },
    afterRender: (callback) => {
      void nextTick(callback);
    },
    onUpdate: (value) => emit('update:modelValue', value),
    onChange: (value) => emit('change', value),
    onFinish: (value) => emit('finish', value),
    onInput: (value, index, event) => emit('input', value, index, event),
  });
  watch([mergedValue, () => props.length], ([value], [previous]) =>
    foundation.syncValue(value, previous),
  );

  function setInputRef(element: Element | ComponentPublicInstance | null, index: number) {
    if (element) {
      inputRefList.value[index] = element as FocusableInput;
    } else {
      delete inputRefList.value[index];
    }
  }

  const focusFirstEmptyInput = foundation.focusEmpty;
  const handleCursorToEnd = foundation.cursorToEnd;
  const handlePaste = foundation.paste;
  const handleKeydown = foundation.keydown;
  const handleInput = foundation.input;
  const focus = () => foundation.focus();
  const blur = () => foundation.blur();

  defineExpose({ focus, blur });
</script>
