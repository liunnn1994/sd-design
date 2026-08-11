<template>
  <VNodeRenderer v-if="loading && loadingIconVNode" :content="loadingIconVNode" />
  <IconLoading v-else-if="loading" />
  <template v-else-if="icon">
    <IconHover v-if="needIconHover" :class="`${prefixCls}-icon-hover`">
      <span :class="`${prefixCls}-switcher-icon`" @click="onClick">
        <VNodeRenderer :content="icon" />
      </span>
    </IconHover>
    <span v-else :class="`${prefixCls}-switcher-icon`" @click="onClick">
      <VNodeRenderer :content="icon" />
    </span>
  </template>
</template>

<script setup lang="ts">
  import type { PropType, VNode, VNodeChild } from 'vue';
  import { computed, h, useSlots } from 'vue';

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
  const nodeSwitcherIcon = usePickSlots(slots, 'switcher-icon');
  const nodeLoadingIcon = usePickSlots(slots, 'loading-icon');
  const treeContext = useTreeContext();

  const loadingIconVNode = computed<VNode | undefined>(() => {
    const icon = props.icons?.loadingIcon ?? nodeLoadingIcon.value;
    return icon
      ? icon(props.nodeStatus)
      : treeContext.loadingIcon?.(props.treeNodeData, props.nodeStatus);
  });

  const switcherIconVNode = computed<VNode | undefined>(() => {
    const icon = props.icons?.switcherIcon ?? nodeSwitcherIcon.value;
    return icon
      ? icon(props.nodeStatus)
      : treeContext.switcherIcon?.(props.treeNodeData, props.nodeStatus);
  });

  const needIconHover = computed(() => {
    const { isLeaf } = props.nodeStatus ?? {};
    return !isLeaf && !props.showLine;
  });

  // Resolves the switcher icon: a custom icon (slot/context) wins over the
  // default built-in icon (caret for expandable nodes, file for showLine leaves).
  const icon = computed<VNode | null>(() => {
    const { expanded, isLeaf } = props.nodeStatus ?? {};
    const custom = switcherIconVNode.value;
    if (!isLeaf) {
      if (custom) return custom;
      return props.showLine
        ? h('span', { class: `${props.prefixCls}-${expanded ? 'minus' : 'plus'}-icon` })
        : h(IconCaretDown);
    }
    if (props.showLine) {
      return custom ?? h(IconFile);
    }
    return custom ?? null;
  });

  const onClick = (e: Event) => emit('click', e);
</script>
