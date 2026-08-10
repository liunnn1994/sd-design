<template>
  <BaseTreeNode :key="key" v-bind="{ ...props, ...$attrs }">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </BaseTreeNode>
  <TransitionNodeList :key="key" :node-key="key" />
</template>

<script setup lang="ts">
  import BaseTreeNode from './base-node.vue';
  import useNodeKey from './hooks/use-node-key';
  import TransitionNodeList from './transition-node-list.vue';

  defineOptions({
    name: 'TreeNode',
    inheritAttrs: false,
  });

  const props = defineProps({
    ...BaseTreeNode.props,
  });

  const key = useNodeKey();
</script>
