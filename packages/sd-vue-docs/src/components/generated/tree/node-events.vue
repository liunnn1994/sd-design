<template>
  <sd-tree
    :data="treeData"
    @node-click="onNodeEvent"
    @node-mouseover="onNodeEvent"
    @node-long-press="onNodeEvent"
    @node-swipe-end="onNodeSwipeEnd"
  />
  <div class="sd:mt-3">最近触发：{{ latestEvent }}</div>
</template>

<script setup lang="ts">
  import type { TreeNodeData, TreeNodeSwipeEventData } from '@sdata/web-vue';

  import { ref } from 'vue';

  const treeData: TreeNodeData[] = [
    {
      title: 'Trunk 0-0',
      key: '0-0',
      children: [
        {
          title: 'Leaf 0-0-1',
          key: '0-0-1',
        },
      ],
    },
  ];

  const latestEvent = ref('暂未触发');

  function onNodeEvent(node: TreeNodeData, event: Event) {
    latestEvent.value = `${node.title} / ${event.type}`;
  }

  function onNodeSwipeEnd(node: TreeNodeData, event: TouchEvent, data: TreeNodeSwipeEventData) {
    latestEvent.value = `${node.title} / ${event.type} / ${data.direction}`;
  }
</script>
