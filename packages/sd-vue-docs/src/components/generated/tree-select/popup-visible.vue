<template>
  <div class="sd:mb-6">
    <sd-button type="primary" @click="onClick">切换</sd-button>
  </div>
  <sd-tree-select
    :popupVisible="popupVisible"
    :allow-clear="true"
    :data="treeData"
    placeholder="请选择…"
    class="sd:w-75"
  ></sd-tree-select>
</template>
<script setup lang="ts">
  import type { TreeNodeData } from '@sdata/web-vue';

  import { ref } from 'vue';

  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      title: '主干节点',
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

  const popupVisible = ref(false);
  function onClick() {
    popupVisible.value = !popupVisible.value;
  }
</script>
