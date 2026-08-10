<template>
  <DefineSuffix>
    <button
      v-if="showClearBtn"
      type="button"
      :class="`${prefixCls}-clear-btn`"
      :aria-label="t('a11y.clear')"
      @click="handleClear"
      @mousedown.stop
    >
      <IconHover><IconClose /></IconHover>
    </button>
    <span :class="`${prefixCls}-icon`">
      <slot v-if="loading && $slots['loading-icon']" name="loading-icon" />
      <IconLoading v-else-if="loading" />
      <slot v-else-if="allowSearch && opened && $slots['search-icon']" name="search-icon" />
      <IconSearch v-else-if="allowSearch && opened" />
      <slot v-else-if="$slots['arrow-icon']" name="arrow-icon" />
      <IconDown v-else-if="showArrow" :class="`${prefixCls}-arrow-icon`" />
    </span>
    <FeedbackIcon v-if="feedback" :type="feedback" />
  </DefineSuffix>

  <InputTag
    v-if="multiple"
    v-bind="$attrs"
    ref="componentRef"
    :base-cls="prefixCls"
    :class="cls"
    :model-value="modelValue"
    :input-value="inputValue"
    :focused="opened"
    :placeholder="placeholder"
    :disabled="mergedDisabled"
    :size="mergedSize"
    :error="mergedError"
    :max-tag-count="maxTagCount"
    :disabled-input="!allowSearch && !allowCreate"
    :tag-nowrap="tagNowrap"
    retain-input-value
    uninject-form-item-context
    :input-attrs="inputAttrs"
    :fit-width="fitWidth"
    :max-w-full="maxWFull"
    @remove="handleRemove"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <template v-if="$slots.prefix" #prefix><slot name="prefix" /></template>
    <template #suffix><ReuseSuffix /></template>
    <template v-if="$slots.tag || $slots.label" #tag="slotProps">
      <slot v-if="$slots.tag" name="tag" v-bind="slotProps" />
      <slot v-else name="label" v-bind="slotProps" />
    </template>
  </InputTag>
  <InputLabel
    v-else
    v-bind="$attrs"
    ref="componentRef"
    :base-cls="prefixCls"
    :class="cls"
    :model-value="modelValue[0]"
    :input-value="inputValue"
    :focused="opened"
    :placeholder="placeholder"
    :disabled="mergedDisabled"
    :size="mergedSize"
    :error="mergedError"
    :enabled-input="enabledInput"
    uninject-form-item-context
    :input-attrs="inputAttrs"
    :fit-width="fitWidth"
    :max-w-full="maxWFull"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <template v-if="$slots.label" #default="slotProps">
      <slot name="label" v-bind="slotProps" />
    </template>
    <template v-if="$slots.prefix" #prefix><slot name="prefix" /></template>
    <template #suffix><ReuseSuffix /></template>
  </InputLabel>
</template>

<script setup lang="ts">
  import type { ComponentPublicInstance, VNode } from 'vue';
  import { computed, ref, toRef, watch } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { Size } from '../../_utils/constant';
  import type { SelectViewValue } from './interface';

  import { useFormItem } from '../../_hooks/use-form-item';
  import { useSize } from '../../_hooks/use-size';
  import { getPrefixCls } from '../../_utils/global-config';
  import IconClose from '../../icon/icon-close';
  import IconDown from '../../icon/icon-down';
  import IconLoading from '../../icon/icon-loading';
  import IconSearch from '../../icon/icon-search';
  import InputTag from '../../input-tag';
  import { useI18n } from '../../locale';
  import FeedbackIcon from '../feedback-icon.vue';
  import IconHover from '../icon-hover.vue';
  import InputLabel from '../input-label/input-label.vue';

  defineOptions({ name: 'SelectView', inheritAttrs: false });

  const props = withDefaults(
    defineProps<{
      modelValue: SelectViewValue[];
      inputValue?: string;
      placeholder?: string;
      disabled?: boolean;
      error?: boolean;
      loading?: boolean;
      opened?: boolean;
      size?: Size;
      bordered?: boolean;
      multiple?: boolean;
      allowClear?: boolean;
      allowCreate?: boolean;
      showArrow?: boolean;
      allowSearch?: boolean;
      maxTagCount?: number | 'responsive';
      tagNowrap?: boolean;
      retainInputValue?: boolean;
      inputAttrs?: Record<string, unknown>;
      fitWidth?: boolean;
      maxWFull?: boolean;
    }>(),
    {
      disabled: false,
      error: false,
      loading: false,
      opened: false,
      bordered: true,
      multiple: false,
      allowClear: false,
      allowCreate: false,
      showArrow: true,
      allowSearch: true,
      maxTagCount: 0,
      tagNowrap: false,
      retainInputValue: false,
      fitWidth: false,
      maxWFull: true,
    },
  );
  const emit = defineEmits<{
    remove: [tag: string];
    clear: [event: MouseEvent];
    focus: [event: FocusEvent];
    blur: [event: FocusEvent];
  }>();
  defineSlots<{
    'prefix'?: () => VNode[];
    'label'?: (props: { data: SelectViewValue }) => VNode[];
    'tag'?: (props: { data: SelectViewValue }) => VNode[];
    'loading-icon'?: () => VNode[];
    'search-icon'?: () => VNode[];
    'arrow-icon'?: () => VNode[];
  }>();

  const [DefineSuffix, ReuseSuffix] = createReusableTemplate();
  const { t } = useI18n();
  const prefixCls = getPrefixCls('select-view');
  const {
    feedback,
    eventHandlers,
    mergedDisabled,
    mergedSize: formItemSize,
    mergedError,
  } = useFormItem({
    size: toRef(props, 'size'),
    disabled: toRef(props, 'disabled'),
    error: toRef(props, 'error'),
  });
  const { mergedSize } = useSize(formItemSize);
  const componentRef = ref<ComponentPublicInstance>();
  const inputRef = computed<HTMLInputElement | undefined>(
    () => (componentRef.value as { inputRef?: HTMLInputElement } | undefined)?.inputRef,
  );
  const isEmptyValue = computed(() => props.modelValue.length === 0);
  const enabledInput = computed(() => props.allowSearch || props.allowCreate);
  const showClearBtn = computed(() => props.allowClear && !props.disabled && !isEmptyValue.value);
  const cls = computed(() => [
    `${prefixCls}-${props.multiple ? 'multiple' : 'single'}`,
    {
      [`${prefixCls}-opened`]: props.opened,
      [`${prefixCls}-borderless`]: !props.bordered,
    },
  ]);
  const handleFocus = (event: FocusEvent) => {
    emit('focus', event);
    eventHandlers.value?.onFocus?.(event);
  };
  const handleBlur = (event: FocusEvent) => {
    emit('blur', event);
    eventHandlers.value?.onBlur?.(event);
  };
  const handleRemove = (tag: string | number) => emit('remove', tag as string);
  const handleClear = (event: MouseEvent) => emit('clear', event);
  const focus = () => inputRef.value?.focus();
  const blur = () => inputRef.value?.blur();

  watch(
    () => props.opened,
    (opened) => {
      if (!opened && inputRef.value?.isSameNode(document.activeElement)) {
        inputRef.value.blur();
      }
    },
  );

  defineExpose({ inputRef, focus, blur });
</script>
