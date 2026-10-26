<template>
  <div class="sd:mb-5">
    <sd-radio-group v-model="size" type="button">
      <sd-radio value="mini">迷你</sd-radio>
      <sd-radio value="small">小</sd-radio>
      <sd-radio value="medium">中</sd-radio>
      <sd-radio value="large">大</sd-radio>
    </sd-radio-group>
  </div>
  <sd-tree class="sd:mr-5" :blockNode="true" :checkable="true" :size="size" :data="treeData" />
</template>
<script setup lang="ts">
  import type { Size, TreeNodeData } from '@sdata/web-vue';

  import { ref } from 'vue';

  const treeData: TreeNodeData[] = [
    {
      title: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '分支 0-0-0',
          key: '0-0-0',
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

  const size = ref<Size>('medium');
</script>
