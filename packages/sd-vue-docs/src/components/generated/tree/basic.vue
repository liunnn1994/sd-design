<template>
  <sd-tree
    :data="treeData"
    :default-expanded-keys="['0-0-0']"
    :default-selected-keys="['0-0-0', '0-0-1']"
  />
</template>
<script setup lang="ts">
  import type { TreeNodeData } from '@sdata/web-vue';

  const treeData: TreeNodeData[] = [
    {
      title: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '分支 0-0-0',
          key: '0-0-0',
          disabled: true,
          children: [
            {
              title: '叶子节点',
              key: '0-0-0-0',
            },
            {
              title: '叶子节点',
              key: '0-0-0-1',
            },
          ],
        },
        {
          title: '分支 0-0-1',
          key: '0-0-1',
          children: [
            {
              title: '叶子节点',
              key: '0-0-1-0',
            },
          ],
        },
      ],
    },
  ];
</script>
