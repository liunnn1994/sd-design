<template>
  <sd-space direction="vertical" size="large">
    <sd-tree-select
      defaultValue="node0"
      :data="treeData"
      placeholder="请选择…"
      class="sd:w-75"
    ></sd-tree-select>
    <sd-tree-select
      defaultValue="node0"
      :data="treeData"
      :fallback-option="false"
      placeholder="请选择…"
      class="sd:w-75"
    ></sd-tree-select>
    <sd-tree-select
      defaultValue="node0"
      :data="treeData"
      :fallback-option="fallback"
      placeholder="请选择…"
      class="sd:w-75"
    ></sd-tree-select>
    <sd-tree-select
      :defaultValue="['node0', 'node2']"
      :data="treeData"
      multiple
      placeholder="请选择…"
      class="sd:w-75"
    ></sd-tree-select>
    <sd-tree-select
      :defaultValue="['node0', 'node2']"
      :data="treeData"
      :fallback-option="false"
      multiple
      placeholder="请选择…"
      class="sd:w-75"
    ></sd-tree-select>
    <sd-tree-select
      :default-value="['node0', 'node2']"
      :data="treeData"
      :fallback-option="fallback"
      multiple
      placeholder="请选择…"
      class="sd:w-75"
    ></sd-tree-select>
  </sd-space>
</template>

<script setup lang="ts">
  import type { TreeNodeData, TreeNodeKey } from '@sdata/web-vue';

  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      title: '主干节点 1',
      children: [
        {
          key: 'node2',
          title: '叶子节点 1',
        },
      ],
    },
    {
      key: 'node3',
      title: '主干节点 2',
      children: [
        {
          key: 'node4',
          title: '叶子节点 2',
        },
        {
          key: 'node5',
          title: '叶子节点 3',
        },
      ],
    },
  ];

  function fallback(key: TreeNodeKey) {
    return {
      key,
      title: `++${key}++`,
    };
  }
</script>
