<template>
  <div class="sd:mb-5">
    <sd-radio-group v-model="size" type="button">
      <sd-radio value="mini">迷你</sd-radio>
      <sd-radio value="small">小</sd-radio>
      <sd-radio value="medium">中</sd-radio>
      <sd-radio value="large">大</sd-radio>
    </sd-radio-group>
  </div>
  <sd-tree-select
    defaultValue="node1"
    :size="size"
    :data="treeData"
    placeholder="请选择…"
    class="sd:w-75"
  ></sd-tree-select>
</template>
<script setup lang="ts">
  import type { Size, TreeNodeData } from '@sdata/web-vue';

  import { ref } from 'vue';

  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      title: '节点 1',
      disabled: true,
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
          isLeaf: true,
        },
        {
          key: 'node5',
          title: '节点 5',
          isLeaf: true,
        },
      ],
    },
  ];

  const size = ref<Size>('medium');
</script>
