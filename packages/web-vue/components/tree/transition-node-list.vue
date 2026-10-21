<template>
  <ExpandTransition :expanded="expanded" @end="onTransitionEnd">
    <div v-if="show" :class="classNames">
      <BaseTreeNode v-for="node in visibleNodeList" :key="node.key" v-bind="node.treeNodeProps" />
    </div>
  </ExpandTransition>
</template>

<script setup lang="ts">
  import { computed, PropType, toRefs, watchEffect } from 'vue';

  import { getTransitionTreeNodes } from '@sdata/web-core/tree/query';

  import type { Node, TreeNodeData } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import BaseTreeNode from './base-node.vue';
  import ExpandTransition from './expand-transition.vue';
  import useTreeContext from './hooks/use-tree-context';
  import { TreeNodeKey } from './interface';

  defineOptions({ name: 'TransitionNodeList' });

  const props = defineProps({
    nodeKey: {
      type: [String, Number] as PropType<TreeNodeKey>,
      required: true,
    },
  });

  const prefixCls = getPrefixCls('tree');
  const classNames = [`${prefixCls}-node-list`];

  const treeContext = useTreeContext();

  const { nodeKey } = toRefs(props);

  const expanded = computed(() => treeContext.expandedKeys?.includes?.(nodeKey.value));

  const visibleNodeList = computed(() =>
    getTransitionTreeNodes<TreeNodeData, Node>({
      nodes: treeContext.flattenTreeData,
      nodeKey: nodeKey.value,
      expandedKeys: treeContext.expandedKeys || [],
      expanded: expanded.value,
      filter: treeContext.filterTreeNode,
    }),
  );

  const show = computed(
    () => treeContext.currentExpandKeys?.includes(nodeKey.value) && visibleNodeList.value?.length,
  );

  watchEffect(() => {
    if (treeContext.currentExpandKeys?.includes(nodeKey.value) && !visibleNodeList.value?.length) {
      treeContext.onExpandEnd?.(nodeKey.value);
    }
  });

  function onTransitionEnd() {
    treeContext.onExpandEnd?.(nodeKey.value);
  }
</script>
