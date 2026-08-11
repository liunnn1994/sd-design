<template>
  <Operations
    :editable="editable"
    :copyable="copyable"
    :expandable="expandable"
    :is-copied="isCopied"
    :is-ellipsis="isEllipsis"
    :expanded="expanded"
    :force-render-expand="forceRenderExpand"
    :edit-tooltip-props="editTooltipProps"
    :copy-tooltip-props="copyTooltipProps"
    @edit="onEdit"
    @copy="onCopy"
    @expand="onExpand"
  >
    <template v-if="copyTooltip" #copy-tooltip="slotProps">
      <component :is="copyTooltip" v-bind="slotProps" />
    </template>
    <template v-if="copyIcon" #copy-icon="slotProps">
      <component :is="copyIcon" v-bind="slotProps" />
    </template>
    <template v-if="expandNode" #expand-node="slotProps">
      <component :is="expandNode" v-bind="slotProps" />
    </template>
  </Operations>
</template>

<script setup lang="ts">
  import type { Slot } from 'vue';

  import type { BaseProps } from './interface';

  import Operations from './operations.vue';

  defineOptions({ name: 'TypographyOperations' });

  defineProps<{
    editable?: BaseProps['editable'];
    copyable?: BaseProps['copyable'];
    expandable?: boolean;
    isCopied: boolean;
    isEllipsis: boolean;
    expanded: boolean;
    forceRenderExpand?: boolean;
    editTooltipProps?: Record<string, unknown>;
    copyTooltipProps?: Record<string, unknown>;
    onEdit: () => void;
    onCopy: () => void;
    onExpand: () => void;
    copyTooltip?: Slot;
    copyIcon?: Slot;
    expandNode?: Slot;
  }>();
</script>
