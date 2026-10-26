<template>
  <sd-tree :data="treeData">
    <template #icon>
      <IconStar />
    </template>
  </sd-tree>
</template>
<script setup lang="ts">
  import type { TreeNodeData } from '@sdata/web-vue';

  import { h } from 'vue';

  import { IconDriveFile, IconStar } from '@sdata/web-vue/es/icon/index.js';

  const treeData: TreeNodeData[] = [
    {
      title: '主干节点',
      key: 'node1',
      children: [
        {
          title: '叶子节点',
          key: 'node2',
        },
      ],
    },
    {
      title: '主干节点',
      key: 'node3',
      children: [
        {
          title: '叶子节点',
          key: 'node4',
          icon: () => h(IconDriveFile),
        },
        {
          title: '叶子节点',
          key: 'node5',
          icon: () => h(IconDriveFile),
        },
      ],
    },
  ];
</script>
