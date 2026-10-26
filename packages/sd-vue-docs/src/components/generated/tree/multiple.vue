<template>
  <sd-checkbox
    class="sd:mb-6"
    v-model="multiple"
    @change="
      () => {
        selectedKeys = [];
      }
    "
  >
    多选
  </sd-checkbox>
  <br />
  <sd-typography-text> 当前项： {{ selectedKeys?.join(' , ') }} </sd-typography-text>
  <br />
  <sd-tree v-model:selected-keys="selectedKeys" :multiple="multiple" :data="treeData" />
</template>
<script setup lang="ts">
  import type { TreeNodeData, TreeNodeKey } from '@sdata/web-vue';

  import { ref } from 'vue';

  const selectedKeys = ref<TreeNodeKey[]>([]);
  const multiple = ref(true);
  const treeData: TreeNodeData[] = [
    {
      title: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '叶子节点',
          key: '0-0-1',
        },
        {
          title: '分支 0-0-2',
          key: '0-0-2',
          children: [
            {
              title: '叶子节点',
              key: '0-0-2-1',
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
              title: '叶子节点',
              key: '0-1-1-1',
            },
            {
              title: '叶子节点',
              key: '0-1-1-2',
            },
          ],
        },
        {
          title: '叶子节点',
          key: '0-1-2',
        },
      ],
    },
  ];
</script>
