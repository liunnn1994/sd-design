<template>
  <DefineOperations v-slot="{ forceRenderExpand = false }">
    <Operations
      :editable="props.editable"
      :copyable="props.copyable"
      :expandable="ellipsisConfig.expandable"
      :is-copied="isCopied"
      :is-ellipsis="ellipsisConfig.css ? showCSSTooltip : isEllipsis"
      :expanded="expanded"
      :force-render-expand="forceRenderExpand || (ellipsisConfig.css && expanded)"
      :edit-tooltip-props="props.editTooltipProps"
      :copy-tooltip-props="props.copyTooltipProps"
      @edit="onEditStart"
      @copy="onCopyClick"
      @expand="onExpandClick"
    >
      <template #copy-tooltip="slotProps">
        <slot name="copy-tooltip" v-bind="slotProps" />
      </template>
      <template #copy-icon="slotProps">
        <slot name="copy-icon" v-bind="slotProps" />
      </template>
      <template #expand-node="slotProps">
        <slot name="expand-node" v-bind="slotProps" />
      </template>
    </Operations>
  </DefineOperations>

  <DefineCssOuter>
    <component
      :is="props.component"
      ref="wrapperRef"
      v-bind="rootAttrs"
      :class="classNames"
      :style="ellipsisStyle"
    >
      <span ref="contentRef"><VNodeRenderer :content="getWrappedChildren()" /></span>
    </component>
  </DefineCssOuter>

  <EditContent
    v-if="mergeEditing"
    :text="editTextValue"
    @change="handleEditContentChange"
    @end="onEditEnd"
  />
  <template v-else-if="ellipsisConfig.css">
    <component
      :is="ellipsisConfig.TooltipComponent"
      v-if="showCSSTooltip"
      v-bind="ellipsisConfig.tooltipProps"
      @resize="calTooltip"
    >
      <template #content>{{ fullText }}</template>
      <ReuseCssOuter />
    </component>
    <ResizeObserver v-else @resize="calTooltip">
      <ReuseCssOuter />
    </ResizeObserver>
  </template>
  <ResizeObserver v-else @resize="resizeOnNextFrame">
    <component :is="props.component" ref="wrapperRef" v-bind="rootAttrs" :class="classNames">
      <component
        :is="ellipsisConfig.TooltipComponent"
        v-if="showEllipsis && ellipsisConfig.showTooltip"
        v-bind="ellipsisConfig.tooltipProps"
      >
        <template #content>{{ fullText }}</template>
        <span><VNodeRenderer :content="getDisplayContent()" /></span>
      </component>
      <VNodeRenderer v-else :content="getDisplayContent()" />
      <template v-if="showEllipsis">{{ ellipsisConfig.ellipsisStr }}</template>
      {{ ellipsisConfig.suffix }}
      <ReuseOperations />
    </component>
  </ResizeObserver>
</template>

<script setup lang="ts">
  import type { Options as ClipboardOptions } from 'copy-to-clipboard';

  import {
    computed,
    h,
    onMounted,
    onUnmounted,
    onUpdated,
    reactive,
    ref,
    toRef,
    useAttrs,
    useSlots,
    watch,
    type PropType,
    type VNode,
    type VNodeChild,
  } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';
  import copy from 'copy-to-clipboard';

  import type { BaseProps, EllipsisConfig, EllipsisInternalConfig } from './interface';

  import ResizeObserver from '../_components/resize-observer.vue';
  import useMergeState from '../_hooks/use-merge-state';
  import { getPrefixCls } from '../_utils/global-config';
  import { isObject } from '../_utils/is';
  import { omit } from '../_utils/omit';
  import { caf, raf } from '../_utils/raf';
  import Popover from '../popover';
  import Tooltip from '../tooltip';
  import EditContent from './edit-content.vue';
  import Operations from './operations.vue';
  import getInnerText from './utils/getInnerText';
  import measure from './utils/measure';

  interface BaseInternalProps extends BaseProps {
    component: keyof HTMLElementTagNameMap;
  }

  const VNodeRenderer = (_props: { content?: VNodeChild }) => _props.content;

  const normalizeEllipsisConfig = (config: EllipsisConfig): EllipsisInternalConfig => {
    const showTooltip = !!config.showTooltip;
    const TooltipComponent =
      isObject(config.showTooltip) && config.showTooltip.type === 'popover' ? Popover : Tooltip;
    const tooltipProps = (isObject(config.showTooltip) && config.showTooltip.props) || {};
    return {
      rows: 1,
      suffix: '',
      ellipsisStr: '...',
      expandable: false,
      css: false,
      ...omit(config, ['showTooltip']),
      showTooltip,
      TooltipComponent,
      tooltipProps,
    };
  };

  defineOptions({ name: 'TypographyBase', inheritAttrs: false });

  const props = defineProps({
    component: {
      type: String as PropType<BaseInternalProps['component']>,
      required: true,
    },
    type: String as PropType<'primary' | 'secondary' | 'success' | 'danger' | 'warning'>,
    bold: Boolean,
    mark: {
      type: [Boolean, Object] as PropType<boolean | { color: string }>,
      default: false,
    },
    underline: Boolean,
    delete: Boolean,
    code: Boolean,
    disabled: Boolean,
    editable: Boolean,
    editing: {
      type: Boolean,
      default: undefined,
    },
    defaultEditing: Boolean,
    editText: String,
    copyable: Boolean,
    copyText: String,
    clipboardProps: Object as PropType<ClipboardOptions>,
    copyDelay: {
      type: Number,
      default: 3000,
    },
    ellipsis: {
      type: [Boolean, Object] as PropType<boolean | EllipsisConfig>,
      default: false,
    },
    editTooltipProps: Object,
    copyTooltipProps: Object,
  });

  const emit = defineEmits({
    'editStart': () => true,
    'change': (_text: string) => true,
    'update:editText': (_text: string) => true,
    'editEnd': () => true,
    'update:editing': (_editing: boolean) => true,
    'copy': (_text: string) => true,
    'ellipsis': (_isEllipsis: boolean) => true,
    'expand': (_expanded: boolean) => true,
  });

  const attrs = useAttrs();
  const slots = useSlots();
  const [DefineOperations, ReuseOperations] = createReusableTemplate<{
    forceRenderExpand?: boolean;
  }>();
  const [DefineCssOuter, ReuseCssOuter] = createReusableTemplate();
  const prefixCls = getPrefixCls('typography');
  const classNames = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-${props.type}`]: props.type,
      [`${prefixCls}-disabled`]: props.disabled,
    },
  ]);
  const wrapperRef = ref<HTMLElement>();
  const fullText = ref('');
  const [editing, setEditing] = useMergeState(
    props.defaultEditing,
    reactive({ value: toRef(props, 'editing') }),
  );
  const mergeEditing = computed(() => props.editable && editing.value);
  const editTextValue = computed(() => props.editText ?? fullText.value);

  const onEditStart = () => {
    emit('update:editing', true);
    emit('editStart');
    setEditing(true);
  };
  const onEditChange = (text: string) => {
    emit('update:editText', text);
    emit('change', text);
  };
  const handleEditContentChange = (text: string) => {
    if (text !== editTextValue.value) onEditChange(text);
  };
  const onEditEnd = () => {
    if (!editing.value) return;
    emit('update:editing', false);
    emit('editEnd');
    setEditing(false);
  };

  const isCopied = ref(false);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;
  const onCopyClick = () => {
    const text = props.copyText ?? fullText.value;
    copy(text || '', props.clipboardProps);
    isCopied.value = true;
    emit('copy', text);
    copyTimer = setTimeout(() => {
      isCopied.value = false;
    }, props.copyDelay);
  };

  const isEllipsis = ref(false);
  const expanded = ref(false);
  const ellipsisText = ref('');
  const ellipsisConfig = computed<EllipsisInternalConfig>(() =>
    normalizeEllipsisConfig((isObject(props.ellipsis) && props.ellipsis) || {}),
  );
  const showEllipsis = computed(() => isEllipsis.value && !expanded.value);
  const rootAttrs = computed(() => ({
    ...(showEllipsis.value && !ellipsisConfig.value.showTooltip ? { title: fullText.value } : {}),
    ...attrs,
  }));
  let rafId: number | null = null;
  const onExpandClick = () => {
    expanded.value = !expanded.value;
    emit('expand', expanded.value);
  };

  const renderOperations = (forceRenderExpand = false) =>
    h(
      Operations,
      {
        editable: props.editable,
        copyable: props.copyable,
        expandable: ellipsisConfig.value.expandable,
        isCopied: isCopied.value,
        isEllipsis: ellipsisConfig.value.css ? showCSSTooltip.value : isEllipsis.value,
        expanded: expanded.value,
        forceRenderExpand: forceRenderExpand || (ellipsisConfig.value.css && expanded.value),
        editTooltipProps: props.editTooltipProps,
        copyTooltipProps: props.copyTooltipProps,
        onEdit: onEditStart,
        onCopy: onCopyClick,
        onExpand: onExpandClick,
      },
      {
        'copy-tooltip': slots['copy-tooltip'],
        'copy-icon': slots['copy-icon'],
        'expand-node': slots['expand-node'],
      },
    );

  const calEllipsis = () => {
    if (!wrapperRef.value) return;
    const result = measure(
      wrapperRef.value,
      ellipsisConfig.value,
      renderOperations(!!ellipsisConfig.value.expandable),
      fullText.value,
    );
    if (isEllipsis.value !== result.ellipsis) {
      isEllipsis.value = result.ellipsis;
      if (!ellipsisConfig.value.css) emit('ellipsis', result.ellipsis);
    }
    if (ellipsisText.value !== result.text) ellipsisText.value = result.text || '';
  };
  const resizeOnNextFrame = () => {
    if (!props.ellipsis || expanded.value) return;
    if (rafId != null) caf(rafId);
    rafId = raf(calEllipsis);
  };

  watch(() => ellipsisConfig.value.rows, resizeOnNextFrame);
  watch(toRef(props, 'ellipsis'), (value) => {
    if (value) resizeOnNextFrame();
    else isEllipsis.value = false;
  });

  let children: VNode[] = [];
  const getChildren = () => {
    children = slots.default?.() || [];
    return children;
  };
  const getWrappedContent = (content: VNodeChild) => {
    const tags: (keyof HTMLElementTagNameMap)[] = [];
    if (props.bold) tags.push('b');
    if (props.underline) tags.push('u');
    if (props.delete) tags.push('del');
    if (props.code) tags.push('code');
    if (props.mark) tags.push('mark');
    const markStyle =
      isObject(props.mark) && props.mark.color ? { backgroundColor: props.mark.color } : {};
    return tags.reduce<VNodeChild>(
      (wrapped, tag) =>
        h(tag, tag === 'mark' ? { style: markStyle } : {}, wrapped == null ? [] : [wrapped]),
      content,
    );
  };
  const getWrappedChildren = () => getWrappedContent(getChildren());
  const getDisplayContent = () =>
    getWrappedContent(showEllipsis.value ? ellipsisText.value : getChildren());
  const updateFullText = () => {
    if (props.ellipsis || props.copyable || props.editable) {
      const text = getInnerText(children);
      if (text !== fullText.value) {
        fullText.value = text;
        resizeOnNextFrame();
      }
    }
  };
  onMounted(updateFullText);
  onUpdated(updateFullText);

  const contentRef = ref<HTMLElement>();
  const showCSSTooltip = ref(false);
  const calTooltip = () => {
    if (wrapperRef.value && contentRef.value) {
      const show = contentRef.value.offsetHeight > wrapperRef.value.offsetHeight;
      if (show !== showCSSTooltip.value) {
        showCSSTooltip.value = show;
        emit('ellipsis', show);
      }
    }
  };
  const ellipsisStyle = computed(() =>
    expanded.value
      ? {}
      : {
          'overflow': 'hidden',
          'text-overflow': 'ellipsis',
          'display': '-webkit-box',
          '-webkit-line-clamp': ellipsisConfig.value.rows,
          '-webkit-box-orient': 'vertical',
        },
  );

  onUnmounted(() => {
    if (copyTimer) clearTimeout(copyTimer);
    if (rafId != null) caf(rafId);
  });
</script>
