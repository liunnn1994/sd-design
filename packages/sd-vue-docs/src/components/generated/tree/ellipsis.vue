<template>
  <div class="tree-ellipsis-demo">
    <sd-tree blockNode ellipsis :data="treeData" />
    <sd-tree blockNode ellipsis="performant-ellipsis" :data="treeData" />
  </div>
</template>
<script setup lang="ts">
  import type { TreeNodeData } from '@sdata/web-vue';

  const longTitle =
    '这是一段很长的树节点标题，用来展示节点标题开启 Ellipsis 后在有限宽度内的省略效果';

  const treeData: TreeNodeData[] = [
    {
      title: longTitle,
      key: '0-0',
      children: [
        {
          title: `${longTitle} - 子节点`,
          key: '0-0-0',
        },
      ],
    },
  ];
</script>
<style scoped>
  .tree-ellipsis-demo {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 240px));
    gap: 16px;
  }
</style>
