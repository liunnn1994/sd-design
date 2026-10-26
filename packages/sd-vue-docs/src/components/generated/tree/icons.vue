<template>
  <sd-tree :data="treeData" show-line>
    <template #switcher-icon="{ isLeaf }">
      <IconDown v-if="!isLeaf" />
      <IconStar v-if="isLeaf" />
    </template>
  </sd-tree>
</template>

<script setup lang="ts">
  import type { TreeNodeData } from '@sdata/web-vue';

  import { h } from 'vue';

  import { IconDown, IconDriveFile, IconStar } from '@sdata/web-vue/es/icon/index.js';

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
          switcherIcon: () => h(IconDriveFile),
        },
        {
          title: '叶子节点',
          key: 'node5',
          switcherIcon: () => h(IconDriveFile),
        },
      ],
    },
  ];
</script>
