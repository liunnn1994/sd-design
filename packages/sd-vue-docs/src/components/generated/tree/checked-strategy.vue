<template>
  <sd-radio-group
    type="button"
    v-model="checkedStrategy"
    @change="
      (value) => {
        checkedKeys = [];
      }
    "
  >
    <sd-radio v-for="item in strategyOptions" :key="item?.value" :value="item?.value">
      {{ item?.label }}
    </sd-radio>
  </sd-radio-group>
  <br />
  <sd-typography-text class="sd:my-6 sd:inline-block">
    当前项： {{ checkedKeys?.join(' , ') }}
  </sd-typography-text>
  <br />
  <sd-tree
    :checkable="true"
    v-model:checked-keys="checkedKeys"
    :checked-strategy="checkedStrategy"
    :data="treeData"
  />
</template>
<script setup lang="ts">
  import type { CheckedStrategy, TreeNodeData, TreeNodeKey } from '@sdata/web-vue';

  import { ref } from 'vue';

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

  const strategyOptions: Array<{ value: CheckedStrategy; label: string }> = [
    {
      value: 'all',
      label: '显示全部',
    },
    {
      value: 'parent',
      label: '显示父节点',
    },
    {
      value: 'child',
      label: '显示子节点',
    },
  ];

  const checkedKeys = ref<TreeNodeKey[]>([]);
  const checkedStrategy = ref<CheckedStrategy>('all');
</script>
