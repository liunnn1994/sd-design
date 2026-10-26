<template>
  <sd-space>
    <sd-tree-select
      v-model="selected"
      :multiple="true"
      :allow-clear="true"
      :allow-search="true"
      :data="treeData"
      placeholder="请选择…"
      class="sd:w-75"
    ></sd-tree-select>
    <sd-tree-select
      v-model="selected"
      :multiple="true"
      :max-tag-count="2"
      :allow-clear="true"
      :allow-search="true"
      :data="treeData"
      placeholder="请选择…"
      class="sd:w-75"
    ></sd-tree-select>
  </sd-space>
</template>
<script setup lang="ts">
  import type { LabelValue, TreeNodeData } from '@sdata/web-vue';

  import { h, ref } from 'vue';

  import { IconCalendar } from '@sdata/web-vue/es/icon/index.js';

  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      icon: () => h(IconCalendar),
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
      icon: () => h(IconCalendar),
      children: [
        {
          key: 'node4',
          title: '节点 4',
        },
        {
          key: 'node5',
          title: '节点 5',
        },
      ],
    },
  ];

  const selected = ref<LabelValue[]>([]);
</script>
