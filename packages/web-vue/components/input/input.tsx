import type { PropType, StyleValue } from 'vue';
import { computed, defineComponent, nextTick, ref, toRef, toRefs, watch } from 'vue';

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

export default defineComponent({
  name: 'Input',
  inheritAttrs: false,
  props: {
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
     * @zh 输入框大小
     * @en Input size
     * @values 'mini','small','medium','large'
     * @defaultValue 'medium'
     */
    size: {
      type: String as PropType<Size>,
    },
    /**
     * @zh 是否允许清空输入框
     * @en Whether to allow the input to be cleared
     */
    allowClear: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否禁用
     * @en Whether to disable
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否为只读状态
     * @en Whether it is read-only
     */
    readonly: {
      type: [Boolean, String],
      default: false,
    },
    /**
     * @zh 是否为错误状态
     * @en Whether it is an error state
     */
    error: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 提示文字
     * @en Prompt text
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
     * @zh 输入值的最大长度，errorOnly 属性在 2.12.0 版本添加
     * @en Enter the maximum length of the value, the errorOnly attribute was added in version 2.12.0
     */
    maxLength: {
      type: [Number, Object] as PropType<number | { length: number; errorOnly?: boolean }>,
      default: 0,
    },
    /**
     * @zh 是否显示字数统计
     * @en Whether to display word count
     */
    showWordLimit: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 字符长度的计算方法
     * @en Calculation method of word length
     */
    wordLength: {
      type: Function as PropType<(value: string) => number>,
    },
    /**
     * @zh 字符截取方法，同 wordLength 一起使用
     * @en Character interception method, used together with wordLength
     * @version 2.12.0
     */
    wordSlice: {
      type: Function as PropType<(value: string, maxLength: number) => string>,
    },
    /**
     * @zh 内部 input 元素的属性
     * @en Attributes of inner input elements
     * @version 2.27.0
     */
    inputAttrs: {
      type: Object,
    },
    // private
    type: {
      type: String as PropType<'text' | 'password'>,
      default: 'text',
    },
    // private
    fitWidthFallback: {
      type: String,
      default: '4ch',
    },
    /**
     * @zh 前置标签
     * @en Prepend
     * @version 2.57.0
     */
    prepend: String,
    /**
     * @zh 后置标签
     * @en Append
     * @version 2.57.0
     */
    append: String,
  },
  emits: {
    'update:modelValue': (_value: string) => true,
    /**
     * @zh 用户输入时触发
     * @en Triggered when the user enters
     * @param {string} value
     * @param {Event} ev
     */
    'input': (_value: string, _ev: Event) => true,
    /**
     * @zh 仅在输入框失焦或按下回车时触发
     * @en Only triggered when the input box is out of focus or when you press Enter
     * @param {string} value
     * @param {Event} ev
     */
    'change': (_value: string, _ev: Event) => true,
    /**
     * @zh 用户按下回车时触发
     * @en Triggered when the user presses enter
     * @param {KeyboardEvent} ev
     */
    'pressEnter': (_ev: KeyboardEvent) => true,
    /**
     * @zh 用户点击清除按钮时触发
     * @en Triggered when the user clicks the clear button
     * @param {MouseEvent} ev
     */
    'clear': (_ev: MouseEvent) => true,
    /**
     * @zh 输入框获取焦点时触发
     * @en Triggered when the input box gets focus
     * @param {FocusEvent} ev
     */
    'focus': (_ev: FocusEvent) => true,
    /**
     * @zh 输入框失去焦点时触发
     * @en Triggered when the input box loses focus
     * @param {FocusEvent} ev
     */
    'blur': (_ev: FocusEvent) => true,
  },
  /**
   * @zh 前缀元素
   * @en Prefix
   * @slot prefix
   */
  /**
   * @zh 后缀元素
   * @en Suffix
   * @slot suffix
   */
  /**
   * @zh 前置标签
   * @en Prepend
   * @slot prepend
   */
  /**
   * @zh 后置标签
   * @en Append
   * @slot append
   */
  setup(props, { emit, slots, attrs }) {
    const { t } = useI18n();
    const { size, disabled, error, modelValue, allowClear } = toRefs(props);
    const prefixCls = getPrefixCls('input');
    const inputRef = ref<HTMLInputElement>();
    const {
      mergedSize: _mergedSize,
      mergedDisabled,
      mergedError: _mergedError,
      feedback,
      eventHandlers,
      formItemCtx,
    } = useFormItem({ size, disabled, error });
    const { mergedSize } = useSize(_mergedSize);
    const { mergedAllowClear } = useAllowClear(allowClear);
    const [recordCursor, setCursor] = useCursor(inputRef);

    const { tipVisible, show: showReadonlyTip } = useReadonlyTip(
      toRef(props, 'readonly'),
      mergedDisabled,
    );
    const readonlyTipText = useReadonlyTipText(toRef(props, 'readonly'));

    // 值相关
    const _value = ref(props.defaultValue);
    const computedValue = computed(() => props.modelValue ?? _value.value);
    let preValue = computedValue.value;

    watch(modelValue, (value) => {
      if (isUndefined(value) || isNull(value)) {
        _value.value = '';
      }
    });

    watch(computedValue, (value, oldValue) => {
      preValue = oldValue;
    });

    // 状态相关
    const focused = ref(false);
    const showClearBtn = computed(
      () =>
        mergedAllowClear.value &&
        !props.readonly &&
        !mergedDisabled.value &&
        Boolean(computedValue.value),
    );

    // 输入法相关
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

    const getValueLength = (value: string) => {
      if (isFunction(props.wordLength)) {
        return props.wordLength(value);
      }
      return countGraphemes(value);
    };

    const valueLength = computed(() => getValueLength(computedValue.value));

    const mergedError = computed(
      () =>
        _mergedError.value ||
        Boolean(
          isObject(props.maxLength) &&
          props.maxLength.errorOnly &&
          valueLength.value > maxLength.value,
        ),
    );

    const maxLengthErrorOnly = computed(
      () => isObject(props.maxLength) && Boolean(props.maxLength.errorOnly),
    );

    const maxLength = computed(() => {
      if (isObject(props.maxLength)) {
        return props.maxLength.length;
      }
      return props.maxLength;
    });

    const defaultMaxLength = computed(() => {
      const bytePerChar = getValueLength('a');
      return Math.floor(maxLength.value / bytePerChar);
    });

    const updateValue = (value: string) => {
      if (maxLength.value && !maxLengthErrorOnly.value && getValueLength(value) > maxLength.value) {
        if (isFunction(props.wordSlice)) {
          value = props.wordSlice(value, maxLength.value);
        } else if (isFunction(props.wordLength)) {
          value = value.slice(0, defaultMaxLength.value);
        } else {
          value = sliceGraphemes(value, defaultMaxLength.value);
        }
      }

      _value.value = value;
      emit('update:modelValue', value);
    };

    const handleMousedown = (e: MouseEvent) => {
      if (inputRef.value && e.target !== inputRef.value) {
        e.preventDefault();
        inputRef.value.focus();
      }
    };

    const emitChange = (value: string, ev: Event) => {
      if (value !== preValue) {
        preValue = value;
        emit('change', value, ev);
        eventHandlers.value?.onChange?.(ev);
      }
    };

    const handleFocus = (ev: FocusEvent) => {
      focused.value = true;
      emit('focus', ev);
      eventHandlers.value?.onFocus?.(ev);
    };

    const handleBlur = (ev: FocusEvent) => {
      focused.value = false;
      emitChange(computedValue.value, ev);
      emit('blur', ev);
      eventHandlers.value?.onBlur?.(ev);
    };

    const handleComposition = (e: CompositionEvent) => {
      const { value, selectionStart, selectionEnd } = e.target as HTMLInputElement;

      if (e.type === 'compositionend') {
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
        emit('input', value, e);
        eventHandlers.value?.onInput?.(e);

        keepControl();
      } else {
        isComposition.value = true;
        compositionValue.value = computedValue.value + (e.data ?? '');
      }
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

    const handleInput = (e: Event) => {
      const { value } = e.target as HTMLInputElement;

      if (!isComposition.value) {
        if (
          maxLength.value &&
          !maxLengthErrorOnly.value &&
          valueLength.value >= maxLength.value &&
          getValueLength(value) > maxLength.value &&
          (e as InputEvent).inputType === 'insertText'
        ) {
          keepControl();
          return;
        }

        updateValue(value);
        emit('input', value, e);
        eventHandlers.value?.onInput?.(e);

        keepControl();
      }
    };

    const handleClear = (ev: MouseEvent) => {
      updateValue('');
      emitChange('', ev);
      emit('clear', ev);
    };

    // 清除按钮（role=button，图标无原生按钮语义）：Enter/Space 触发
    const handleClearKeydown = (ev: KeyboardEvent) => {
      if (isActivationKey(ev)) {
        ev.preventDefault();
        handleClear(ev as unknown as MouseEvent);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (props.readonly && !mergedDisabled.value && isReadonlyModificationKey(e)) {
        showReadonlyTip();
      }
      const keyCode = e.key || e.code;
      if (!isComposition.value && keyCode === Enter.key) {
        emitChange(computedValue.value, e);
        emit('pressEnter', e);
      }
    };

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
      const wrapperAttrs = omit(attrs, INPUT_EVENTS) as Record<string, unknown>;
      return {
        ...wrapperAttrs,
        style: [fitWidthStyle.value, wrapperAttrs.style as StyleValue],
      };
    });
    const inputAttrs = computed(() => pick(attrs, INPUT_EVENTS));
    const mergeInputAttrs = computed(() => {
      const attrs = {
        ...inputAttrs.value,
        ...props.inputAttrs,
      };
      // 关联 form-item 的 label（`for`）：消费者未显式给 input id 时，用 form-item 注入的 fieldId
      if (formItemCtx.fieldId && attrs.id === undefined) {
        attrs.id = formItemCtx.fieldId;
      }
      if (mergedError.value) {
        attrs['aria-invalid'] = true;
      }
      attrs.style = [
        props.fitWidth
          ? {
              flex: `0 1 ${fitWidthValue}`,
              width: fitWidthValue,
              minWidth: 0,
            }
          : undefined,
        attrs.style as StyleValue,
      ];
      return attrs;
    });

    const renderInput = (hasOuter?: boolean) => (
      <span
        class={wrapperCls.value}
        onMousedown={handleMousedown}
        {...(!hasOuter ? wrapperAttrs.value : undefined)}
      >
        {slots.prefix && <span class={`${prefixCls}-prefix`}>{slots.prefix()}</span>}
        <input
          ref={inputRef}
          class={cls.value}
          value={computedValue.value}
          type={props.type}
          placeholder={props.placeholder}
          readonly={!!props.readonly}
          disabled={mergedDisabled.value}
          onInput={handleInput}
          onKeydown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onCompositionstart={handleComposition}
          onCompositionupdate={handleComposition}
          onCompositionend={handleComposition}
          {...mergeInputAttrs.value}
        />
        {showClearBtn.value && (
          <IconHover
            prefix={prefixCls}
            class={`${prefixCls}-clear-btn`}
            {...{
              'onClick': handleClear,
              'onKeydown': handleClearKeydown,
              'role': 'button',
              'tabindex': 0,
              'aria-label': t('a11y.clear'),
            }}
          >
            <IconClose />
          </IconHover>
        )}
        {(slots.suffix ||
          (Boolean(props.maxLength) && props.showWordLimit) ||
          Boolean(feedback.value)) && (
          <span
            class={[
              `${prefixCls}-suffix`,
              { [`${prefixCls}-suffix-has-feedback`]: feedback.value },
            ]}
          >
            {Boolean(props.maxLength) && props.showWordLimit && (
              <span class={`${prefixCls}-word-limit`}>
                {valueLength.value}/{maxLength.value}
              </span>
            )}
            {slots.suffix?.()}
            {Boolean(feedback.value) && <FeedbackIcon type={feedback.value} />}
          </span>
        )}
      </span>
    );

    const render = () => {
      const node =
        slots.prepend || slots.append || props.prepend || props.append ? (
          <span class={outerCls.value} {...wrapperAttrs.value}>
            {(slots.prepend || props.prepend) && (
              <span class={`${prefixCls}-prepend`}>
                {slots.prepend ? slots.prepend() : props.prepend}
              </span>
            )}
            {renderInput(true)}
            {(slots.append || props.append) && (
              <span class={`${prefixCls}-append`}>
                {slots.append ? slots.append() : props.append}
              </span>
            )}
          </span>
        ) : (
          renderInput()
        );
      return (
        <Tooltip popupVisible={tipVisible.value} content={readonlyTipText.value} position="top">
          {node}
        </Tooltip>
      );
    };

    return {
      inputRef,
      render,
    };
  },
  methods: {
    /**
     * @zh 使输入框获取焦点
     * @en Make the input box focus
     * @public
     */
    focus() {
      (this.inputRef as HTMLInputElement)?.focus();
    },
    /**
     * @zh 使输入框失去焦点
     * @en Make the input box lose focus
     * @public
     */
    blur() {
      (this.inputRef as HTMLInputElement)?.blur();
    },
  },
  render() {
    return this.render();
  },
});
