<template>
  <DefineDisplay>
    <RichLineClamp
      v-if="props.ellipsis"
      v-bind="rootAttrs"
      :as="props.component"
      :class="classNames"
      :html="richHtml"
      :max-lines="ellipsisConfig.rows"
      :ellipsis="ellipsisConfig.ellipsisStr"
      :expanded="expanded"
      @clampchange="handleClampChange"
    >
      <template #after>
        {{ ellipsisConfig.suffix }}
        <TypographyOperations v-bind="getOperationsProps()" />
      </template>
    </RichLineClamp>
    <component v-else :is="props.component" v-bind="rootAttrs" :class="classNames">
      <TypographyContent :content="getChildren()" :tags="contentTags" :mark-style="markStyle" />
      <TypographyOperations v-bind="getOperationsProps()" />
    </component>
  </DefineDisplay>

  <EditContent
    v-if="mergeEditing"
    :text="editTextValue"
    @change="handleEditContentChange"
    @end="onEditEnd"
  />
  <component
    :is="ellipsisConfig.TooltipComponent"
    v-else-if="props.ellipsis && ellipsisConfig.showTooltip"
    v-bind="ellipsisConfig.tooltipProps"
    :disabled="!isEllipsis"
  >
    <template #content>{{ fullText }}</template>
    <ReuseDisplay />
  </component>
  <ReuseDisplay v-else />
</template>

<script setup lang="ts">
  import type { Options as ClipboardOptions } from 'copy-to-clipboard';

  import type { PropType, VNode } from 'vue';
  import {
    computed,
    onMounted,
    onUnmounted,
    onUpdated,
    reactive,
    shallowRef,
    toRef,
    useAttrs,
    useSlots,
  } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';
  import copy from 'copy-to-clipboard';

  import type { BaseProps, EllipsisConfig, EllipsisInternalConfig } from './interface';

  import useMergeState from '../_hooks/use-merge-state';
  import { getPrefixCls } from '../_utils/global-config';
  import { isObject } from '../_utils/is';
  import { omit } from '../_utils/omit';
  import { RichLineClamp } from '../clamp';
  import Popover from '../popover';
  import Tooltip from '../tooltip';
  import EditContent from './edit-content.vue';
  import TypographyContent from './typography-content.vue';
  import TypographyOperations from './typography-operations.vue';
  import getInnerText from './utils/getInnerText';

  interface BaseInternalProps extends BaseProps {
    component: keyof HTMLElementTagNameMap;
  }

  const normalizeEllipsisConfig = (config: EllipsisConfig): EllipsisInternalConfig => {
    const showTooltip = Boolean(config.showTooltip);
    const TooltipComponent =
      isObject(config.showTooltip) && config.showTooltip.type === 'popover' ? Popover : Tooltip;
    const tooltipProps = (isObject(config.showTooltip) && config.showTooltip.props) || {};
    return {
      rows: 1,
      suffix: '',
      ellipsisStr: '...',
      expandable: false,
      ...omit(config, ['showTooltip']),
      showTooltip,
      TooltipComponent,
      tooltipProps,
    };
  };

  defineOptions({ name: 'TypographyBase', inheritAttrs: false });

  const props = defineProps({
    component: { type: String as PropType<BaseInternalProps['component']>, required: true },
    type: String as PropType<'primary' | 'secondary' | 'success' | 'danger' | 'warning'>,
    bold: Boolean,
    mark: { type: [Boolean, Object] as PropType<boolean | { color: string }>, default: false },
    underline: Boolean,
    delete: Boolean,
    code: Boolean,
    disabled: Boolean,
    editable: Boolean,
    editing: { type: Boolean, default: undefined },
    defaultEditing: Boolean,
    editText: String,
    copyable: Boolean,
    copyText: String,
    clipboardProps: Object as PropType<ClipboardOptions>,
    copyDelay: { type: Number, default: 3000 },
    ellipsis: { type: [Boolean, Object] as PropType<boolean | EllipsisConfig>, default: false },
    editTooltipProps: Object,
    copyTooltipProps: Object,
  });
  const emit = defineEmits<{
    'editStart': [];
    'change': [text: string];
    'update:editText': [text: string];
    'editEnd': [];
    'update:editing': [editing: boolean];
    'copy': [text: string];
    'ellipsis': [isEllipsis: boolean];
    'expand': [expanded: boolean];
  }>();

  const attrs = useAttrs();
  const slots = useSlots();
  const [DefineDisplay, ReuseDisplay] = createReusableTemplate();
  const prefixCls = getPrefixCls('typography');
  const classNames = computed(() => [
    prefixCls,
    { [`${prefixCls}-${props.type}`]: props.type, [`${prefixCls}-disabled`]: props.disabled },
  ]);
  const fullText = shallowRef('');
  const isEllipsis = shallowRef(false);
  const expanded = shallowRef(false);
  const [editing, setEditing] = useMergeState(
    props.defaultEditing,
    reactive({ value: toRef(props, 'editing') }),
  );
  const mergeEditing = computed(() => props.editable && editing.value);
  const editTextValue = computed(() => props.editText ?? fullText.value);
  const ellipsisConfig = computed(() =>
    normalizeEllipsisConfig((isObject(props.ellipsis) && props.ellipsis) || {}),
  );
  const rootAttrs = computed(() => ({
    ...(isEllipsis.value && !expanded.value && !ellipsisConfig.value.showTooltip
      ? { title: fullText.value }
      : {}),
    ...attrs,
  }));
  const contentTags = computed(() => {
    const tags: (keyof HTMLElementTagNameMap)[] = [];
    if (props.bold) tags.push('b');
    if (props.underline) tags.push('u');
    if (props.delete) tags.push('del');
    if (props.code) tags.push('code');
    if (props.mark) tags.push('mark');
    return tags;
  });
  const markStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {};
    if (isObject(props.mark) && props.mark.color) style.backgroundColor = props.mark.color;
    return style;
  });
  const escapeHtml = (value: string) =>
    value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const styleAttribute = (style?: Record<string, string>) => {
    const text = style
      ? Object.entries(style)
          .map(
            ([name, value]) => `${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:${value}`,
          )
          .join(';')
      : '';
    return text ? ` style="${escapeHtml(text)}"` : '';
  };
  // 与 TypographyContent 的标签包裹顺序保持一致：外层为最后一个标签（mark 最外），
  // 自定义 mark 颜色通过内联 style 注入到 mark 标签上。
  const richHtml = computed(() =>
    [...contentTags.value].reverse().reduce((html, tag) => {
      const style = tag === 'mark' ? styleAttribute(markStyle.value) : '';
      return `<${tag}${style}>${html}</${tag}>`;
    }, escapeHtml(fullText.value)),
  );

  let children: VNode[] = [];
  const getChildren = () => (children = slots.default?.() || []);
  const updateFullText = () => {
    if (props.ellipsis || props.copyable || props.editable) {
      const nextFullText = getInnerText(getChildren());
      if (fullText.value !== nextFullText) {
        fullText.value = nextFullText;
      }
    }
  };
  const handleClampChange = (value: boolean) => {
    if (isEllipsis.value !== value) {
      isEllipsis.value = value;
      emit('ellipsis', value);
    }
  };
  const onEditStart = () => {
    emit('update:editing', true);
    emit('editStart');
    setEditing(true);
  };
  const handleEditContentChange = (text: string) => {
    if (text !== editTextValue.value) {
      emit('update:editText', text);
      emit('change', text);
    }
  };
  const onEditEnd = () => {
    if (!editing.value) return;
    emit('update:editing', false);
    emit('editEnd');
    setEditing(false);
  };
  const isCopied = shallowRef(false);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;
  const onCopyClick = () => {
    const text = props.copyText ?? fullText.value;
    copy(text, props.clipboardProps);
    isCopied.value = true;
    emit('copy', text);
    copyTimer = setTimeout(() => (isCopied.value = false), props.copyDelay);
  };
  const onExpandClick = () => {
    expanded.value = !expanded.value;
    emit('expand', expanded.value);
  };
  const getOperationsProps = () => ({
    editable: props.editable,
    copyable: props.copyable,
    expandable: ellipsisConfig.value.expandable,
    isCopied: isCopied.value,
    isEllipsis: isEllipsis.value,
    expanded: expanded.value,
    forceRenderExpand: expanded.value,
    editTooltipProps: props.editTooltipProps,
    copyTooltipProps: props.copyTooltipProps,
    onEdit: onEditStart,
    onCopy: onCopyClick,
    onExpand: onExpandClick,
    copyTooltip: slots['copy-tooltip'],
    copyIcon: slots['copy-icon'],
    expandNode: slots['expand-node'],
  });

  onMounted(updateFullText);
  onUpdated(updateFullText);
  onUnmounted(() => {
    if (copyTimer) clearTimeout(copyTimer);
  });
</script>
