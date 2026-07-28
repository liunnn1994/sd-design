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
      title: 'node1',
      children: [
        {
          key: 'node2',
          title: 'node2',
        },
      ],
    },
    {
      key: 'node3',
      title: 'node3',
      children: [
        {
          key: 'node4',
          title: 'node4',
        },
        {
          key: 'node5',
          title: 'node5',
          children: [
            {
              key: 'node6',
              title: 'node6',
            },
            {
              key: 'node7',
              title: 'node7',
            },
          ],
        },
      ],
    },
  ];
</script>
