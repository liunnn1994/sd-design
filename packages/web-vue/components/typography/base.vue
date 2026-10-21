<template>
  <DefineDisplay v-slot="{ content }">
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
      <TypographyContent :content="content" :tags="contentTags" :mark-style="markStyle" />
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
    <ReuseDisplay :content="props.ellipsis ? undefined : getChildren()" />
  </component>
  <ReuseDisplay v-else :content="props.ellipsis ? undefined : getChildren()" />
</template>

<script setup lang="ts">
  import type { ClipboardOptions } from '@sdata/web-core/clipboard';

  import type { AppContext, ComponentInternalInstance, PropType, VNode } from 'vue';
  import {
    computed,
    getCurrentInstance,
    onMounted,
    onUnmounted,
    onUpdated,
    reactive,
    shallowRef,
    toRef,
    useAttrs,
    useSlots,
  } from 'vue';

  import copy from '@sdata/web-core/clipboard';
  import {
    normalizeTypographyEllipsis,
    getTypographyContentTags,
    getTypographyMarkStyle,
    getTypographyRichHtml,
  } from '@sdata/web-core/typography/data';
  import { createTypographyFoundation } from '@sdata/web-core/typography/foundation';
  import { createReusableTemplate } from '@vueuse/core';

  import type { BaseProps, EllipsisConfig, EllipsisInternalConfig } from './interface';

  import useMergeState from '../_hooks/use-merge-state';
  import { getPrefixCls } from '../_utils/global-config';
  import { isObject } from '../_utils/is';
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

  const normalizeEllipsisConfig = (config: EllipsisConfig): EllipsisInternalConfig =>
    normalizeTypographyEllipsis<EllipsisInternalConfig['TooltipComponent']>(config, {
      popover: Popover,
      tooltip: Tooltip,
    });
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
  const instance = getCurrentInstance() as ComponentInternalInstance & Pick<AppContext, 'provides'>;
  const textAppContext = { ...instance.appContext, provides: instance.provides };
  const [DefineDisplay, ReuseDisplay] = createReusableTemplate<{ content: VNode[] | undefined }>({
    props: { content: Array as PropType<VNode[]> },
  });
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

  const ellipsisConfig = computed(() =>
    normalizeEllipsisConfig((isObject(props.ellipsis) && props.ellipsis) || {}),
  );
  const contentTags = computed(() => getTypographyContentTags(props));
  const markStyle = computed(() => getTypographyMarkStyle(props));
  const richHtml = computed(() =>
    getTypographyRichHtml(contentTags.value, markStyle.value, fullText.value),
  );
  const getChildren = () => slots.default?.() || [];
  const isCopied = shallowRef(false);
  const foundation: ReturnType<typeof createTypographyFoundation<import('vue').Slot>> =
    createTypographyFoundation(
      {
        props,
        slots,
        get fullText() {
          return fullText.value;
        },
        set fullText(value) {
          fullText.value = value;
        },
        get isEllipsis() {
          return isEllipsis.value;
        },
        set isEllipsis(value) {
          isEllipsis.value = value;
        },
        get expanded() {
          return expanded.value;
        },
        set expanded(value) {
          expanded.value = value;
        },
        get isCopied() {
          return isCopied.value;
        },
        set isCopied(value) {
          isCopied.value = value;
        },
        get editing() {
          return editing.value;
        },
        get editTextValue() {
          return editTextValue.value;
        },
        get ellipsisConfig() {
          return ellipsisConfig.value;
        },
      },
      {
        getInnerText: () => getInnerText(getChildren(), textAppContext),
        copy,
        setEditing,
        updateEditing: (value) => emit('update:editing', value),
        editStart: () => emit('editStart'),
        updateEditText: (text) => emit('update:editText', text),
        change: (text) => emit('change', text),
        editEnd: () => emit('editEnd'),
        copied: (text) => emit('copy', text),
        ellipsis: (value) => emit('ellipsis', value),
        expand: (value) => emit('expand', value),
      },
    );
  const mergeEditing = computed(() => foundation.getMergeEditing());
  const editTextValue = computed(() => foundation.getEditTextValue(props.editText));
  const rootAttrs = computed(() => foundation.getRootAttrs(attrs));
  const {
    updateFullText,
    handleClampChange,
    handleEditContentChange,
    onEditEnd,
    getOperationsProps,
  } = foundation;
  onMounted(updateFullText);
  onUpdated(updateFullText);
  onUnmounted(foundation.dispose);
</script>
