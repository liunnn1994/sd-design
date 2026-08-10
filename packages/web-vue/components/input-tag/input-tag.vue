<template>
  <DefineTagContent v-slot="{ item, index, measure }">
    <template v-if="measure || !isCompressedResponsiveTag(index, item.value)">
      <slot name="tag" :data="getSlotData(item)">{{
        props.formatTag?.(item.raw) ?? item.label
      }}</slot>
    </template>
    <Ellipsis v-else :class="`${prefixCls}-tag-ellipsis`">
      <slot name="tag" :data="getSlotData(item)">{{
        props.formatTag?.(item.raw) ?? item.label
      }}</slot>
    </Ellipsis>
  </DefineTagContent>

  <Tooltip :popup-visible="tipVisible" :content="readonlyTipText" position="top">
    <span ref="wrapperRef" v-bind="wrapperAttrs" :class="cls" @mousedown="handleMousedown">
      <ResizeObserver v-if="isResponsiveMaxTagCount && valueData.length > 0" @resize="handleResize">
        <span :class="`${prefixCls}-resize-observer`" aria-hidden="true" />
      </ResizeObserver>
      <ResizeObserver @resize="handleResize">
        <span ref="mirrorRef" :class="`${prefixCls}-mirror`">{{ mirrorText }}</span>
      </ResizeObserver>
      <span
        v-if="isResponsiveMaxTagCount && valueData.length > 1"
        ref="measureRef"
        :class="`${prefixCls}-measure`"
        aria-hidden="true"
      >
        <Tag
          v-for="(item, index) in valueData"
          :key="`measure-tag-${item.value}`"
          :class="`${prefixCls}-tag`"
          visible
          nowrap
          :closable="isClosableTag(item)"
          v-bind="item.tagProps"
        >
          <ReuseTagContent :item="item" :index="index" measure />
        </Tag>
        <Tag
          v-for="hiddenCount in Math.max(valueData.length - 1, 0)"
          :key="`measure-counter-${hiddenCount}`"
          :class="[`${prefixCls}-tag`, `${prefixCls}-tag-counter`]"
          data-overflow-counter="true"
          :data-hidden-count="hiddenCount"
          visible
          nowrap
        >
          +{{ hiddenCount }}
        </Tag>
      </span>
      <span v-if="$slots.prefix" :class="`${prefixCls}-prefix`"><slot name="prefix" /></span>
      <TransitionGroup
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
              [`${prefixCls}-tag-overflow`]: isCompressedResponsiveTag(index, item.value),
            },
          ]"
          :closable="isClosableTag(item)"
          visible
          :nowrap="props.tagNowrap || isResponsiveMaxTagCount"
          :style="getTagStyle(index)"
          v-bind="item.tagProps"
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
  import Ellipsis from '../ellipsis';
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
    modelValue: Array as PropType<(string | number | TagData)[]>,
    defaultValue: {
      type: Array as PropType<(string | number | TagData)[]>,
      default: () => [],
    },
    inputValue: String,
    defaultInputValue: { type: String, default: '' },
    placeholder: String,
    fitWidth: { type: Boolean, default: false },
    maxWFull: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    readonly: { type: [Boolean, String], default: false },
    allowClear: { type: Boolean, default: false },
    size: String as PropType<Size>,
    maxTagCount: {
      type: [Number, String] as PropType<number | 'responsive'>,
      default: 0,
    },
    retainInputValue: {
      type: [Boolean, Object] as PropType<boolean | { create?: boolean; blur?: boolean }>,
      default: false,
    },
    formatTag: Function as PropType<(data: TagData) => string>,
    uniqueValue: { type: Boolean, default: false },
    fieldNames: Object as PropType<InputTagFieldNames>,
    tagNowrap: { type: Boolean, default: false },
    baseCls: String,
    focused: Boolean,
    disabledInput: Boolean,
    uninjectFormItemContext: Boolean,
    inputAttrs: Object as PropType<Record<string, unknown>>,
  });

  const emit = defineEmits({
    'update:modelValue': (_value: (string | number | TagData)[]) => true,
    'update:inputValue': (_inputValue: string) => true,
    'change': (_value: (string | number | TagData)[], _event: Event) => true,
    'inputValueChange': (_inputValue: string, _event: Event) => true,
    'pressEnter': (_inputValue: string, _event: KeyboardEvent) => true,
    'remove': (_removed: string | number, _event: Event) => true,
    'clear': (_event: MouseEvent) => true,
    'focus': (_event: FocusEvent) => true,
    'blur': (_event: FocusEvent) => true,
  });

  const attrs = useAttrs();
  const slots = useSlots();
  const { size, disabled, error, uninjectFormItemContext, allowClear } = toRefs(props);
  const prefixCls = props.baseCls || getPrefixCls('input-tag');
  const wrapperRef = ref<HTMLElement>();
  const inputRef = ref<HTMLInputElement>();
  const mirrorRef = ref<HTMLElement>();
  const measureRef = ref<HTMLElement>();
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
  const responsiveVisibleTagCount = ref<number | null>(null);
  const responsiveTagMaxWidth = ref(0);
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
    if (isResponsiveMaxTagCount.value) {
      if (!valueData.value.length) return 0;
      return Math.min(
        valueData.value.length,
        Math.max(1, responsiveVisibleTagCount.value ?? valueData.value.length),
      );
    }
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
  const getOuterWidth = (element: HTMLElement | null | undefined) => {
    if (!element) return 0;
    const style = window.getComputedStyle(element);
    return (
      element.offsetWidth +
      (Number.parseFloat(style.marginLeft || '0') || 0) +
      (Number.parseFloat(style.marginRight || '0') || 0)
    );
  };
  const getCounterWidth = (hiddenCount: number) => {
    if (!measureRef.value || hiddenCount <= 0) return 0;
    return getOuterWidth(
      measureRef.value.querySelector(`[data-hidden-count="${hiddenCount}"]`) as HTMLElement | null,
    );
  };
  const isClosableTag = (item: TagDataInfo) =>
    Boolean(item.tagProps?.closable ?? (!mergedDisabled.value && !props.readonly && item.closable));
  const getSlotData = (item: TagDataInfo) => item.raw as TagDataInfo['raw'] & TagDataInfo;
  const syncResponsiveTags = () => {
    if (!isResponsiveMaxTagCount.value) {
      responsiveVisibleTagCount.value = null;
      responsiveTagMaxWidth.value = 0;
      return;
    }
    const totalTags = valueData.value.length;
    if (totalTags <= 1) {
      responsiveVisibleTagCount.value = totalTags;
      responsiveTagMaxWidth.value = 0;
      return;
    }
    const wrapperElement = wrapperRef.value;
    const measureElement = measureRef.value;
    const innerElement = wrapperElement?.querySelector(`.${prefixCls}-inner`) as HTMLElement | null;
    if (!wrapperElement || !measureElement || !innerElement) {
      responsiveVisibleTagCount.value = totalTags;
      responsiveTagMaxWidth.value = 0;
      return;
    }
    const inputWidth = (inputRef.value?.offsetWidth ?? Number.parseFloat(inputStyle.width)) || 12;
    const availableWidth = Math.max(innerElement.clientWidth - inputWidth, 0);
    if (availableWidth <= 0) {
      responsiveVisibleTagCount.value = 1;
      responsiveTagMaxWidth.value = 0;
      return;
    }
    const measuredTags = Array.from(
      measureElement.querySelectorAll(`.${prefixCls}-tag`),
    ) as HTMLElement[];
    const tagWidths = measuredTags.slice(0, totalTags).map(getOuterWidth);
    for (let candidate = totalTags; candidate >= 1; candidate -= 1) {
      const hiddenCount = totalTags - candidate;
      const counterWidth = getCounterWidth(hiddenCount);
      const visibleWidth = tagWidths.slice(0, candidate).reduce((sum, width) => sum + width, 0);
      if (hiddenCount === 0 && visibleWidth <= availableWidth) {
        responsiveVisibleTagCount.value = candidate;
        responsiveTagMaxWidth.value = 0;
        return;
      }
      if (hiddenCount > 0 && candidate > 1 && visibleWidth + counterWidth <= availableWidth) {
        responsiveVisibleTagCount.value = candidate;
        responsiveTagMaxWidth.value = 0;
        return;
      }
      if (hiddenCount > 0 && candidate === 1) {
        const leadTagWidth = Math.max(availableWidth - counterWidth, 0);
        if (leadTagWidth > 0) {
          responsiveVisibleTagCount.value = 1;
          responsiveTagMaxWidth.value = leadTagWidth;
          return;
        }
      }
    }
    responsiveVisibleTagCount.value = 1;
    responsiveTagMaxWidth.value = Math.max(availableWidth - getCounterWidth(totalTags - 1), 0);
  };

  const updateValue = (value: (string | number | TagData)[], event: Event) => {
    innerValue.value = value;
    emit('update:modelValue', value);
    emit('change', value, event);
    eventHandlers.value?.onChange?.(event);
  };
  const handleRemove = (value: string | number, index: number, event: Event) => {
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
    if (props.uniqueValue && computedValue.value?.includes(computedInputValue.value)) {
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
    if (!retainInputValue.value.blur && computedInputValue.value) updateInputValue('', event);
    emit('blur', event);
    eventHandlers.value?.onBlur?.(event);
  };
  const getLastClosableIndex = () => {
    for (let index = valueData.value.length - 1; index >= 0; index -= 1) {
      if (valueData.value[index].closable) return index;
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
    nextTick(syncResponsiveTags);
  };
  onMounted(() => {
    if (mirrorRef.value) setInputWidth(mirrorRef.value.offsetWidth);
    nextTick(syncResponsiveTags);
  });
  watch(computedInputValue, (value) => {
    if (inputRef.value && !isComposition.value && value !== inputRef.value.value) {
      inputRef.value.value = value;
    }
  });
  watch(
    [valueData, computedInputValue, () => props.maxTagCount],
    () => nextTick(syncResponsiveTags),
    {
      deep: true,
    },
  );

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
  const getTagStyle = (index: number): CSSProperties | undefined =>
    isCompressedResponsiveTag(index, tags.value[index]?.value)
      ? { maxWidth: `${responsiveTagMaxWidth.value}px` }
      : undefined;
  const inputElementStyle = computed<CSSProperties>(() => {
    const width = props.fitWidth ? fitWidthValue : inputStyle.width;
    return isResponsiveMaxTagCount.value
      ? { ...inputStyle, width, flex: '0 0 auto', minWidth: width }
      : { ...inputStyle, width };
  });
  function isCompressedResponsiveTag(index: number, value: string | number) {
    return (
      isResponsiveMaxTagCount.value &&
      !isOverflowCounterTag(value) &&
      hiddenTagCount.value > 0 &&
      index === 0 &&
      responsiveTagMaxWidth.value > 0
    );
  }
  const focus = () => inputRef.value?.focus();
  const blur = () => inputRef.value?.blur();
  defineExpose({ inputRef, focus, blur });
</script>
