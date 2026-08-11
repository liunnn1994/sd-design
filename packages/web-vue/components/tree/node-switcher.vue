<template>
  <DefineSwitcherIcon>
    <VNodeRenderer v-if="switcherIconVNode" :content="switcherIconVNode" />
    <span
      v-else-if="!nodeStatus?.isLeaf && showLine"
      :class="`${prefixCls}-${nodeStatus?.expanded ? 'minus' : 'plus'}-icon`"
    />
    <IconCaretDown v-else-if="!nodeStatus?.isLeaf" />
    <IconFile v-else-if="showLine" />
  </DefineSwitcherIcon>

  <VNodeRenderer v-if="loading && loadingIconVNode" :content="loadingIconVNode" />
  <IconLoading v-else-if="loading" />
  <template v-else-if="hasIcon">
    <IconHover v-if="needIconHover" :class="`${prefixCls}-icon-hover`">
      <span :class="`${prefixCls}-switcher-icon`" @click="onClick">
        <ReuseSwitcherIcon />
      </span>
    </IconHover>
    <span v-else :class="`${prefixCls}-switcher-icon`" @click="onClick">
      <ReuseSwitcherIcon />
    </span>
  </template>
</template>

<script setup lang="ts">
  import type { PropType, VNode, VNodeChild } from 'vue';
  import { computed, useSlots } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import IconHover from '../_components/icon-hover.vue';
  import usePickSlots from '../_hooks/use-pick-slots';
  import IconCaretDown from '../icon/icon-caret-down';
  import IconFile from '../icon/icon-file';
  import IconLoading from '../icon/icon-loading';
  import useTreeContext from './hooks/use-tree-context';
  import { TreeNodeData } from './interface';

  const VNodeRenderer = ({ content }: { content: VNodeChild }) => content;

  defineOptions({ name: 'TreeNodeSwitcher' });

  const props = defineProps({
    prefixCls: String,
    loading: Boolean,
    showLine: Boolean,
    treeNodeData: {
      type: Object as PropType<TreeNodeData>,
    },
    icons: {
      type: Object as PropType<Record<string, (() => VNode) | undefined>>,
    },
    nodeStatus: {
      type: Object as PropType<{
        loading?: boolean;
        checked?: boolean;
        selected?: boolean;
        expanded?: boolean;
        indeterminate?: boolean;
        isLeaf?: boolean;
      }>,
    },
  });
  const emit = defineEmits(['click']);

  const slots = useSlots();
  const [DefineSwitcherIcon, ReuseSwitcherIcon] = createReusableTemplate();
  const nodeSwitcherIcon = usePickSlots(slots, 'switcher-icon');
  const nodeLoadingIcon = usePickSlots(slots, 'loading-icon');
  const treeContext = useTreeContext();

  const loadingIconVNode = computed<VNodeChild | undefined>(() => {
    const icon = props.icons?.loadingIcon ?? nodeLoadingIcon.value;
    return icon
      ? icon(props.nodeStatus)
      : treeContext.loadingIcon?.(props.treeNodeData, props.nodeStatus);
  });

  const switcherIconVNode = computed<VNodeChild | undefined>(() => {
    const icon = props.icons?.switcherIcon ?? nodeSwitcherIcon.value;
    return icon
      ? icon(props.nodeStatus)
      : treeContext.switcherIcon?.(props.treeNodeData, props.nodeStatus);
  });

  const needIconHover = computed(() => {
    const { isLeaf } = props.nodeStatus ?? {};
    return !isLeaf && !props.showLine;
  });

  // Matches the original render() gate: a switcher is shown only for
  // expandable nodes (!isLeaf) or showLine leaves. A plain leaf (isLeaf &&
  // !showLine) renders nothing, even when a custom switcherIcon is provided —
  // the custom icon only wins for nodes that already show a switcher.
  const hasIcon = computed(() => !props.nodeStatus?.isLeaf || props.showLine);

  const onClick = (e: Event) => emit('click', e);
</script>
