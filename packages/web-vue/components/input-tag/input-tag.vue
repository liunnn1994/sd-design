<template>
  <DefineTagContent v-slot="{ item }">
    <slot name="tag" :data="getSlotData(item)">{{
      props.formatTag?.(item.raw) ?? item.label
    }}</slot>
  </DefineTagContent>

  <Tooltip :popup-visible="tipVisible" :content="readonlyTipText" position="top">
    <span ref="wrapperRef" v-bind="wrapperAttrs" :class="cls" @mousedown="handleMousedown">
      <ResizeObserver @resize="handleResize">
        <span ref="mirrorRef" :class="`${prefixCls}-mirror`">{{ mirrorText }}</span>
      </ResizeObserver>
      <span v-if="$slots.prefix" :class="`${prefixCls}-prefix`"><slot name="prefix" /></span>
      <WrapClamp
        v-if="isResponsiveMaxTagCount"
        :items="valueData"
        :item-key="(item: TagDataInfo) => item.value"
        :max-lines="1"
        as="span"
        :class="[`${prefixCls}-inner`, `${prefixCls}-inner-responsive`]"
      >
        <template #item="{ item, index }">
          <TransitionGroup tag="span" name="input-tag-zoom" :class="`${prefixCls}-item-holder`">
            <Tag
              :key="`tag-${item.value}`"
              :class="`${prefixCls}-tag`"
              visible
              nowrap
              :ellipsis="!$slots.tag"
              v-bind="item.tagProps"
              :closable="isClosableTag(item)"
              @close="handleRemove(item.value, index, $event)"
            >
              <ReuseTagContent :item="item" :index="index" :measure="false" />
            </Tag>
          </TransitionGroup>
        </template>
        <template #after="{ hiddenItems }">
          <Tag
            v-if="hiddenItems.length"
            :key="hiddenItems.length"
            :class="[`${prefixCls}-tag`, `${prefixCls}-tag-counter`]"
            visible
            nowrap
            :ellipsis="false"
            v-text="`+${hiddenItems.length}`"
          />
          <input
            ref="inputRef"
            v-bind="mergedInputAttrs"
            :class="`${prefixCls}-input`"
            :style="inputElementStyle"
            :placeholder="valueData.length === 0 ? props.placeholder : undefined"
            :disabled="mergedDisabled"
            :readonly="Boolean(props.readonly || props.disabledInput)"
            @input="handleInput"
            @keydown="handleKeyDown"
            @focus="handleFocus"
            @blur="handleBlur"
            @compositionstart="handleComposition"
            @compositionupdate="handleComposition"
            @compositionend="handleComposition"
          />
        </template>
      </WrapClamp>
      <TransitionGroup
        v-else
        tag="span"
        name="input-tag-zoom"
        :class="[
          `${prefixCls}-inner`,
          {
            [`${prefixCls}-inner-responsive`]: isResponsiveMaxTagCount,
            [`${prefixCls}-nowrap`]: props.tagNowrap,
          },
        ]"
      >
        <Tag
          v-for="(item, index) in tags"
          :key="`tag-${item.value}`"
          :class="[
            `${prefixCls}-tag`,
            {
              [`${prefixCls}-tag-counter`]: isOverflowCounterTag(item.value),
            },
          ]"
          visible
          :ellipsis="!$slots.tag"
          :nowrap="props.tagNowrap || isResponsiveMaxTagCount"
          v-bind="item.tagProps"
          :closable="isClosableTag(item)"
          @close="handleRemove(item.value, index, $event)"
        >
          <ReuseTagContent :item="item" :index="index" :measure="false" />
        </Tag>
        <input
          key="input-tag-input"
          ref="inputRef"
          v-bind="mergedInputAttrs"
          :class="`${prefixCls}-input`"
          :style="inputElementStyle"
          :placeholder="valueData.length === 0 ? props.placeholder : undefined"
          :disabled="mergedDisabled"
          :readonly="Boolean(props.readonly || props.disabledInput)"
          @input="handleInput"
          @keydown="handleKeyDown"
          @focus="handleFocus"
          @blur="handleBlur"
          @compositionstart="handleComposition"
          @compositionupdate="handleComposition"
          @compositionend="handleComposition"
        />
      </TransitionGroup>
      <IconHover
        v-if="showClearBtn"
        :class="`${prefixCls}-clear-btn`"
        @click="handleClear"
        @mousedown.stop
      >
        <IconClose />
      </IconHover>
      <span v-if="$slots.suffix || feedback" :class="`${prefixCls}-suffix`">
        <slot name="suffix" />
        <FeedbackIcon v-if="feedback" :type="feedback" />
      </span>
    </span>
  </Tooltip>
</template>

<script setup lang="ts">
  import {
    computed,
    nextTick,
    onMounted,
    reactive,
    ref,
    toRef,
    toRefs,
    useAttrs,
    useSlots,
    watch,
    type CSSProperties,
    type PropType,
    type StyleValue,
  } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { InputTagFieldNames, TagData, TagDataInfo } from './interface';

  import FeedbackIcon from '../_components/feedback-icon.vue';
  import IconHover from '../_components/icon-hover.vue';
  import ResizeObserver from '../_components/resize-observer.vue';
  import { useAllowClear } from '../_hooks/use-allow-clear';
  import { useFitWidth } from '../_hooks/use-fit-width';
  import { useFormItem } from '../_hooks/use-form-item';
  import {
    isReadonlyModificationKey,
    useReadonlyTip,
    useReadonlyTipText,
  } from '../_hooks/use-readonly-tip';
  import { useSize } from '../_hooks/use-size';
  import { INPUT_EVENTS, type Size } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { isNull, isObject, isUndefined } from '../_utils/is';
  import { Backspace, Enter } from '../_utils/keycode';
  import { omit } from '../_utils/omit';
  import pick from '../_utils/pick';
  import { WrapClamp } from '../clamp';
  import IconClose from '../icon/icon-close';
  import Tag from '../tag';
  import Tooltip from '../tooltip';
  import { getValueData } from './utils';

  const DEFAULT_FIELD_NAMES = {
    value: 'value',
    label: 'label',
    closable: 'closable',
    tagProps: 'tagProps',
  };

  defineOptions({ name: 'InputTag', inheritAttrs: false });

  const props = defineProps({
    /**
     * @zh 绑定值
     * @en Value of the input tags
     */
    modelValue: Array as PropType<(string | number | TagData)[]>,
    /**
     * @zh 默认值（非受控状态）
     * @en Default value (uncontrolled state)
     */
    defaultValue: {
      type: Array as PropType<(string | number | TagData)[]>,
      default: () => [],
    },
    /**
     * @zh 输入框的值
     * @en Value of the inner input
     */
    inputValue: String,
    /**
     * @zh 输入框的默认值（非受控状态）
     * @en Default value of the inner input (uncontrolled state)
     */
    defaultInputValue: { type: String, default: '' },
    /**
     * @zh 占位符
     * @en Placeholder of the inner input
     */
    placeholder: String,
    /**
     * @zh 宽度是否适应内容
     * @en Whether the width adapts to the content
     */
    fitWidth: { type: Boolean, default: false },
    /**
     * @zh 最大宽度是否限制为父容器宽度
     * @en Whether the maximum width is limited to the parent container width
     */
    maxWFull: { type: Boolean, default: true },
    /**
     * @zh 是否禁用
     * @en Whether the component is disabled
     */
    disabled: { type: Boolean, default: false },
    /**
     * @zh 是否为错误状态
     * @en Whether the component is in error state
     */
    error: { type: Boolean, default: false },
    /**
     * @zh 是否只读
     * @en Whether the component is readonly
     */
    readonly: { type: [Boolean, String], default: false },
    /**
     * @zh 是否允许清除
     * @en Whether the value can be cleared
     */
    allowClear: { type: Boolean, default: false },
    /**
     * @zh 尺寸
     * @en Size of the component
     */
    size: String as PropType<Size>,
    /**
     * @zh 最多显示的标签数量，超出后折叠
     * @en Maximum number of visible tags before collapsing
     */
    maxTagCount: {
      type: [Number, String] as PropType<number | 'responsive'>,
      default: 0,
    },
    /**
     * @zh 是否保留输入框中已输入但未确认的值
     * @en Whether the unconfirmed input value is retained
     */
    retainInputValue: {
      type: [Boolean, Object] as PropType<boolean | { create?: boolean; blur?: boolean }>,
      default: false,
    },
    /**
     * @zh 自定义标签的渲染文本
     * @en Custom renderer for the tag text
     */
    formatTag: Function as PropType<(data: TagData) => string>,
    /**
     * @zh 是否要求标签值唯一
     * @en Whether tag values must be unique
     */
    uniqueValue: { type: Boolean, default: false },
    /**
     * @zh 数据结构字段映射
     * @en Field mapping of the data source
     */
    fieldNames: Object as PropType<InputTagFieldNames>,
    /**
     * @zh 标签文本是否不换行
     * @en Whether tag text stays on one line
     */
    tagNowrap: { type: Boolean, default: false },
    /**
     * @zh 标签基础类名
     * @en Base class name of the tags
     */
    baseCls: String,
    /**
     * @zh 是否处于聚焦态
     * @en Whether the component is focused
     */
    focused: Boolean,
    /**
     * @zh 是否禁用内部输入框
     * @en Whether the inner input is disabled
     */
    disabledInput: Boolean,
    /**
     * @zh 是否忽略外层 FormItem 的上下文
     * @en Whether to ignore the outer FormItem context
     */
    uninjectFormItemContext: Boolean,
    /**
     * @zh 透传给内部输入框的属性
     * @en Attributes forwarded to the inner input
     */
    inputAttrs: Object as PropType<Record<string, unknown>>,
  });

  const emit = defineEmits<{
    'update:modelValue': [_value: (string | number | TagData)[]];
    'update:inputValue': [_inputValue: string];
    /**
     * @zh 标签值变化时触发
     * @en Trigger when the tag values change
     */
    'change': [_value: (string | number | TagData)[], _event: Event];
    /**
     * @zh 输入框值变化时触发
     * @en Trigger when the input value changes
     */
    'inputValueChange': [_inputValue: string, _event: Event];
    /**
     * @zh 按下回车键时触发
     * @en Trigger when Enter is pressed
     */
    'pressEnter': [_inputValue: string, _event: KeyboardEvent];
    /**
     * @zh 移除标签时触发
     * @en Trigger when a tag is removed
     */
    'remove': [_removed: string | number, _event: Event];
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
  const { size, disabled, error, uninjectFormItemContext, allowClear } = toRefs(props);
  const prefixCls = props.baseCls || getPrefixCls('input-tag');
  const wrapperRef = ref<HTMLElement>();
  const inputRef = ref<HTMLInputElement>();
  const mirrorRef = ref<HTMLElement>();
  const {
    mergedSize: formSize,
    mergedDisabled,
    mergedError,
    feedback,
    eventHandlers,
  } = useFormItem({
    size,
    disabled,
    error,
    uninject: uninjectFormItemContext?.value,
  });
  const { mergedSize } = useSize(formSize);
  const { mergedAllowClear } = useAllowClear(allowClear);
  const { tipVisible, show: showReadonlyTip } = useReadonlyTip(
    toRef(props, 'readonly'),
    mergedDisabled,
  );
  const readonlyTipText = useReadonlyTipText(toRef(props, 'readonly'));
  const mergedFieldNames = computed(() => ({ ...DEFAULT_FIELD_NAMES, ...props.fieldNames }));
  const innerFocused = ref(false);
  const innerValue = ref(props.defaultValue);
  const innerInputValue = ref(props.defaultInputValue);
  const isComposition = ref(false);
  const compositionValue = ref('');
  const inputStyle = reactive({ width: '12px' });
  const [DefineTagContent, ReuseTagContent] = createReusableTemplate<{
    item: TagDataInfo;
    index: number;
    measure: boolean;
  }>();

  const retainInputValue = computed(() =>
    isObject(props.retainInputValue)
      ? { create: false, blur: false, ...props.retainInputValue }
      : { create: props.retainInputValue, blur: props.retainInputValue },
  );
  const mergedFocused = computed(() => props.focused || innerFocused.value);
  const isResponsiveMaxTagCount = computed(() => props.maxTagCount === 'responsive');
  let replacingInput = false;
  watch(isResponsiveMaxTagCount, () => {
    const restoreFocus = innerFocused.value;
    replacingInput = true;
    nextTick(() => {
      replacingInput = false;
      if (restoreFocus) inputRef.value?.focus();
    });
  });
  const computedValue = computed(() => props.modelValue ?? innerValue.value);
  const computedInputValue = computed(() => props.inputValue ?? innerInputValue.value);
  const valueData = computed(() => getValueData(computedValue.value, mergedFieldNames.value));
  const mirrorText = computed(() =>
    valueData.value.length > 0
      ? compositionValue.value || computedInputValue.value
      : compositionValue.value || computedInputValue.value || props.placeholder,
  );
  const fitWidthText = computed(
    () =>
      compositionValue.value ||
      computedInputValue.value ||
      (valueData.value.length === 0 ? props.placeholder : undefined),
  );
  const { fitWidthStyle, fitWidthValue } = useFitWidth({
    fitWidth: () => props.fitWidth,
    text: fitWidthText,
    fallbackWidth: () => (valueData.value.length > 0 ? '12px' : '4ch'),
    target: inputRef,
    additionalWidth: 12,
  });

  const updateInputValue = (value: string, event: Event) => {
    innerInputValue.value = value;
    emit('update:inputValue', value);
    emit('inputValueChange', value, event);
  };
  const handleComposition = (event: CompositionEvent) => {
    const { value } = event.target as HTMLInputElement;
    if (event.type === 'compositionend') {
      isComposition.value = false;
      compositionValue.value = '';
      updateInputValue(value, event);
      nextTick(() => {
        if (inputRef.value && computedInputValue.value !== inputRef.value.value) {
          inputRef.value.value = computedInputValue.value;
        }
      });
    } else {
      isComposition.value = true;
      compositionValue.value = computedInputValue.value + (event.data ?? '');
    }
  };
  watch(
    () => props.modelValue,
    (value) => {
      if (isUndefined(value) || isNull(value)) innerValue.value = [];
    },
  );
  const handleMousedown = (event: MouseEvent) => {
    if (inputRef.value && event.target !== inputRef.value) {
      event.preventDefault();
      inputRef.value.focus();
    }
  };
  const handleInput = (event: Event) => {
    const { value } = event.target as HTMLInputElement;
    if (!isComposition.value) {
      updateInputValue(value, event);
      nextTick(() => {
        if (inputRef.value && computedInputValue.value !== inputRef.value.value) {
          inputRef.value.value = computedInputValue.value;
        }
      });
    }
  };

  const visibleTagCount = computed(() => {
    if (typeof props.maxTagCount === 'number' && props.maxTagCount > 0) {
      return Math.min(props.maxTagCount, valueData.value.length);
    }
    return valueData.value.length;
  });
  const hiddenTagCount = computed(() =>
    Math.max(valueData.value.length - visibleTagCount.value, 0),
  );
  const isOverflowCounterTag = (value: string | number) => value === '__arco__more';
  const tags = computed(() => {
    const visibleTags = valueData.value.slice(0, visibleTagCount.value);
    if (!hiddenTagCount.value) return visibleTags;
    const raw = { value: '__arco__more', label: `+${hiddenTagCount.value}`, closable: false };
    return visibleTags.concat({ raw, ...raw });
  });
  const isClosableTag = (item: TagDataInfo) =>
    !mergedDisabled.value && !props.readonly && Boolean(item.tagProps?.closable ?? item.closable);
  const getSlotData = (item: TagDataInfo) => item.raw as TagDataInfo['raw'] & TagDataInfo;
  const updateValue = (value: (string | number | TagData)[], event: Event) => {
    innerValue.value = value;
    emit('update:modelValue', value);
    emit('change', value, event);
    eventHandlers.value?.onChange?.(event);
  };
  const handleRemove = (value: string | number, index: number, event: Event) => {
    const item = valueData.value[index];
    if (!item || !isClosableTag(item)) return;
    updateValue(
      computedValue.value?.filter((_, itemIndex) => itemIndex !== index),
      event,
    );
    emit('remove', value, event);
  };
  const handleClear = (event: MouseEvent) => {
    updateValue([], event);
    emit('clear', event);
  };
  const showClearBtn = computed(
    () =>
      !mergedDisabled.value &&
      !props.readonly &&
      mergedAllowClear.value &&
      Boolean(computedValue.value.length),
  );
  const handlePressEnter = (event: KeyboardEvent) => {
    if (!computedInputValue.value) return;
    event.preventDefault();
    if (
      props.uniqueValue &&
      valueData.value.some((item) => item.value === computedInputValue.value)
    ) {
      emit('pressEnter', computedInputValue.value, event);
      return;
    }
    updateValue(computedValue.value.concat(computedInputValue.value), event);
    emit('pressEnter', computedInputValue.value, event);
    if (!retainInputValue.value.create) updateInputValue('', event);
  };
  const handleFocus = (event: FocusEvent) => {
    innerFocused.value = true;
    emit('focus', event);
    eventHandlers.value?.onFocus?.(event);
  };
  const handleBlur = (event: FocusEvent) => {
    innerFocused.value = false;
    if (!replacingInput && !retainInputValue.value.blur && computedInputValue.value)
      updateInputValue('', event);
    emit('blur', event);
    eventHandlers.value?.onBlur?.(event);
  };
  const getLastClosableIndex = () => {
    for (let index = valueData.value.length - 1; index >= 0; index -= 1) {
      if (isClosableTag(valueData.value[index])) return index;
    }
    return -1;
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (props.readonly && !mergedDisabled.value && isReadonlyModificationKey(event)) {
      showReadonlyTip();
    }
    if (mergedDisabled.value || props.readonly) return;
    const keyCode = event.key || event.code;
    if (!isComposition.value && computedInputValue.value && keyCode === Enter.key) {
      handlePressEnter(event);
    }
    if (
      !isComposition.value &&
      tags.value.length &&
      !computedInputValue.value &&
      keyCode === Backspace.key
    ) {
      const lastIndex = getLastClosableIndex();
      if (lastIndex >= 0) handleRemove(valueData.value[lastIndex].value, lastIndex, event);
    }
  };
  const setInputWidth = (width: number) => {
    inputStyle.width = width > 12 ? `${width}px` : '12px';
  };
  const handleResize = () => {
    if (mirrorRef.value) setInputWidth(mirrorRef.value.offsetWidth);
  };
  onMounted(() => {
    if (mirrorRef.value) setInputWidth(mirrorRef.value.offsetWidth);
  });
  watch(computedInputValue, (value) => {
    if (inputRef.value && !isComposition.value && value !== inputRef.value.value) {
      inputRef.value.value = value;
    }
  });
  watch(inputRef, (input) => {
    if (input) input.value = computedInputValue.value;
  });

  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-size-${mergedSize.value}`,
    {
      [`${prefixCls}-disabled`]: mergedDisabled.value,
      [`${prefixCls}-disabled-input`]: props.disabledInput,
      [`${prefixCls}-error`]: mergedError.value,
      [`${prefixCls}-focus`]: mergedFocused.value,
      [`${prefixCls}-readonly`]: props.readonly,
      [`${prefixCls}-responsive`]: isResponsiveMaxTagCount.value,
      [`${prefixCls}-has-tag`]: valueData.value.length > 0,
      [`${prefixCls}-has-prefix`]: Boolean(slots.prefix),
      [`${prefixCls}-has-suffix`]: Boolean(slots.suffix) || showClearBtn.value || feedback.value,
      [`${prefixCls}-has-placeholder`]: !computedValue.value.length,
      [`${prefixCls}-fit-width`]: props.fitWidth,
      [`${prefixCls}-max-w-full`]: props.maxWFull,
    },
  ]);
  const wrapperAttrs = computed(() => {
    const outerAttrs = omit(attrs, INPUT_EVENTS) as Record<string, unknown>;
    return { ...outerAttrs, style: [fitWidthStyle.value, outerAttrs.style as StyleValue] };
  });
  const inputEventAttrs = computed(() => pick(attrs, INPUT_EVENTS));
  const mergedInputAttrs = computed(() => ({
    ...inputEventAttrs.value,
    ...props.inputAttrs,
  }));
  const inputElementStyle = computed<CSSProperties>(() => {
    const width = props.fitWidth ? fitWidthValue : inputStyle.width;
    return isResponsiveMaxTagCount.value
      ? { ...inputStyle, width, flex: '0 0 auto', minWidth: width }
      : { ...inputStyle, width };
  });
  const focus = () => inputRef.value?.focus();
  const blur = () => inputRef.value?.blur();
  defineExpose({ inputRef, focus, blur });
</script>
