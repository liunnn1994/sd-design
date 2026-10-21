<template>
  <template v-if="editable">
    <Tooltip :content="t('typography.edit')" v-bind="editTooltipProps">
      <span
        :class="`${prefixCls}-operation-edit`"
        role="button"
        tabindex="0"
        :aria-label="t('typography.edit')"
        @click.stop="onEditClick"
        @keydown="onEditKeydown"
      >
        <IconEdit />
      </span>
    </Tooltip>
  </template>
  <template v-if="copyable">
    <Tooltip v-bind="copyTooltipProps">
      <template #content>
        <slot name="copy-tooltip" :copied="isCopied">
          {{ isCopied ? t('typography.copied') : t('typography.copy') }}
        </slot>
      </template>
      <span
        :class="{
          [`${prefixCls}-operation-copied`]: isCopied,
          [`${prefixCls}-operation-copy`]: !isCopied,
        }"
        role="button"
        tabindex="0"
        :aria-label="isCopied ? t('typography.copied') : t('typography.copy')"
        @click.stop="onCopyClick"
        @keydown="onCopyKeydown"
      >
        <slot name="copy-icon" :copied="isCopied">
          <IconCheckCircleFill v-if="isCopied" />
          <IconCopy v-else />
        </slot>
      </span>
    </Tooltip>
  </template>
  <a
    v-if="showExpand"
    :class="`${prefixCls}-operation-expand`"
    role="button"
    tabindex="0"
    :aria-expanded="expanded"
    @click.stop="onExpandClick"
    @keydown="onExpandKeydown"
  >
    <slot name="expand-node" :expanded="expanded">
      {{ expanded ? t('typography.collapse') : t('typography.expand') }}
    </slot>
  </a>
</template>
<script setup lang="ts">
  import { computed, type PropType } from 'vue';

  import {
    createTypographyOperations,
    getTypographyShowExpand,
  } from '@sdata/web-core/typography/operations';

  import { getPrefixCls } from '../_utils/global-config';
  import IconCheckCircleFill from '../icon/icon-check-circle-fill';
  import IconCopy from '../icon/icon-copy';
  import IconEdit from '../icon/icon-edit';
  import { useI18n } from '../locale';
  import Tooltip from '../tooltip';

  defineOptions({ name: 'TypographyOperations' });

  const props = defineProps({
    editable: Boolean,
    copyable: Boolean,
    expandable: Boolean,
    isCopied: Boolean,
    isEllipsis: Boolean,
    expanded: Boolean,
    forceRenderExpand: Boolean,
    editTooltipProps: {
      type: Object as PropType<Record<string, unknown>>,
    },
    copyTooltipProps: {
      type: Object as PropType<Record<string, unknown>>,
    },
  });

  const emit = defineEmits<{
    /**
     * @zh 点击编辑时触发
     * @en Triggered when editing is clicked
     */
    edit: [];
    /**
     * @zh 点击复制时触发
     * @en Triggered when copy is clicked
     */
    copy: [];
    /**
     * @zh 点击展开时触发
     * @en Triggered when click to expand
     */
    expand: [];
  }>();

  /**
   * @zh 自定义复制按钮的 tooltip 内容
   * @en Customize the tooltip content of the copy button
   * @slot copy-tooltip
   * @binding {boolean} copied
   */
  /**
   * @zh 自定义复制按钮图标
   * @en Custom copy button icon
   * @slot copy-icon
   * @binding {boolean} copied
   */
  /**
   * @zh 自定义展开和折叠按钮
   * @en Custom expand and collapse buttons
   * @slot expand-node
   * @binding {boolean} expanded
   */

  const prefixCls = getPrefixCls('typography');
  const showExpand = computed(() =>
    getTypographyShowExpand(props.forceRenderExpand, props.expandable, props.isEllipsis),
  );
  const { t } = useI18n();

  const { onEditClick, onCopyClick, onExpandClick, onEditKeydown, onCopyKeydown, onExpandKeydown } =
    createTypographyOperations({
      edit: () => emit('edit'),
      copy: () => emit('copy'),
      expand: () => emit('expand'),
    });
</script>
