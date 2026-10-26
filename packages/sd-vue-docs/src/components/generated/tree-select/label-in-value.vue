<template>
  <sd-tree-select
    :data="treeData"
    :label-in-value="true"
    :default-value="{ value: 'node2', label: '叶子节点' }"
    placeholder="请选择…"
    class="sd:w-75"
    @change="onChange"
  ></sd-tree-select>
</template>
<script setup lang="ts">
  import type { TreeNodeData, TreeSelectChangeHandler } from '@sdata/web-vue';

  import { h } from 'vue';

  import { IconCalendar } from '@sdata/web-vue/es/icon/index.js';

  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      icon: () => h(IconCalendar),
      title: '主干节点',
      disabled: true,
      children: [
        {
          key: 'node2',
          title: '叶子节点',
        },
      ],
    },
    {
      key: 'node3',
      title: '主干节点 2',
      icon: () => h(IconCalendar),
      children: [
        {
          key: 'node4',
          title: '叶子节点',
        },
        {
          key: 'node5',
          title: '叶子节点',
        },
      ],
    },
  ];

  function onChange(value: Parameters<TreeSelectChangeHandler>[0]) {
    console.log(value);
  }
</script>
