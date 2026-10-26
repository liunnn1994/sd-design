<template>
  <sd-tree-select :data="treeData" default-value="node1">
    <template #trigger="{ displayValue, selectedOptions, popupVisible }">
      <sd-typography-paragraph class="sd:w-75">
        已选择：
        <a href="javascript: void(0)">{{ displayValue || '未选择' }}</a>
        （{{ selectedOptions.length }} 项，{{ popupVisible ? '收起' : '展开' }}）
      </sd-typography-paragraph>
    </template>
  </sd-tree-select>
</template>
<script setup lang="ts">
  import type { TreeNodeData } from '@sdata/web-vue';

  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      title: '节点 1',
      children: [
        {
          key: 'node2',
          title: '节点 2',
        },
      ],
    },
    {
      key: 'node3',
      title: '节点 3',
      children: [
        {
          key: 'node4',
          title: '节点 4',
        },
        {
          key: 'node5',
          title: '节点 5',
          children: [
            {
              key: 'node6',
              title: '节点 6',
            },
            {
              key: 'node7',
              title: '节点 7',
            },
          ],
        },
      ],
    },
  ];
</script>
