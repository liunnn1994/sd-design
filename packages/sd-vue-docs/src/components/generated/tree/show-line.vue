<template>
  <div class="sd:grid sd:gap-4">
    <div>
      <sd-typography-text>showLine</sd-typography-text>
      <sd-switch v-model="showLine" class="sd:ml-3" />
    </div>
    <sd-tree :default-selected-keys="['0-0-1']" :data="treeData" :show-line="showLine" />
  </div>
</template>
<script setup lang="ts">
  import type { TreeNodeData } from '@sdata/web-vue';

  import { ref } from 'vue';

  const showLine = ref(true);

  const treeData: TreeNodeData[] = [
    {
      title: '主干节点 1',
      key: '0-0',
      children: [
        {
          title: '主干节点 1-0',
          key: '0-0-0',
          children: [
            { title: '叶子节点', key: '0-0-0-0' },
            {
              title: '叶子节点',
              key: '0-0-0-1',
              children: [{ title: '叶子节点', key: '0-0-0-1-0' }],
            },
            { title: '叶子节点', key: '0-0-0-2' },
          ],
        },
        {
          title: '主干节点 1-1',
          key: '0-0-1',
        },
        {
          title: '主干节点 1-2',
          key: '0-0-2',
          children: [
            { title: '叶子节点', key: '0-0-2-0' },
            {
              title: '叶子节点',
              key: '0-0-2-1',
            },
          ],
        },
      ],
    },
    {
      title: '主干节点 2',
      key: '0-1',
    },
    {
      title: '主干节点 3',
      key: '0-2',
      children: [
        {
          title: '主干节点 3-0',
          key: '0-2-0',
          children: [
            { title: '叶子节点', key: '0-2-0-0' },
            { title: '叶子节点', key: '0-2-0-1' },
          ],
        },
      ],
    },
  ];
</script>
