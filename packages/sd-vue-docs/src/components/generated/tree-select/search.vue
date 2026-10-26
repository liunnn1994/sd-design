<template>
  <sd-space>
    <sd-tree-select
      :allow-search="true"
      :allow-clear="true"
      :data="treeData"
      placeholder="请选择…"
      class="sd:w-75"
    ></sd-tree-select>
    <sd-tree-select
      :allow-search="true"
      :allow-clear="true"
      :data="treeData"
      :filter-tree-node="filterTreeNode"
      placeholder="请选择…"
      class="sd:w-75"
    ></sd-tree-select>
  </sd-space>
</template>
<script setup lang="ts">
  import type { TreeNodeData } from '@sdata/web-vue';

  import { ref } from 'vue';

  const treeData: TreeNodeData[] = [
    {
      title: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '分支 0-0-1',
          key: '0-0-1',
          children: [
            {
              title: '叶子节点 0-0-1-1',
              key: '0-0-1-1',
            },
            {
              title: '叶子节点 0-0-1-2',
              key: '0-0-1-2',
            },
          ],
        },
      ],
    },
    {
      title: '主干节点 0-1',
      key: '0-1',
      children: [
        {
          title: '分支 0-1-1',
          key: '0-1-1',
          children: [
            {
              title: '叶子节点 0-1-1-0',
              key: '0-1-1-0',
            },
          ],
        },
        {
          title: '分支 0-1-2',
          key: '0-1-2',
          children: [
            {
              title: '叶子节点 0-1-2-0',
              key: '0-1-2-0',
            },
          ],
        },
      ],
    },
  ];

  function filterTreeNode(searchValue: string, nodeData: TreeNodeData) {
    return (
      String(nodeData.title ?? '')
        .toLowerCase()
        .indexOf(searchValue.toLowerCase()) > -1
    );
  }
</script>
