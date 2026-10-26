<template>
  <div class="sd:mb-6">
    <sd-radio-group
      type="button"
      v-model="treeCheckedStrategy"
      @change="
        (value) => {
          selected = [];
        }
      "
    >
      <sd-radio v-for="item in strategyOptions" :key="item?.value" :value="item?.value">
        {{ item?.label }}
      </sd-radio>
    </sd-radio-group>
  </div>
  <sd-tree-select
    v-model="selected"
    :allow-search="true"
    :allow-clear="true"
    :tree-checkable="true"
    :tree-checked-strategy="treeCheckedStrategy"
    :data="treeData"
    placeholder="请选择…"
    class="sd:w-75"
  ></sd-tree-select>
</template>
<script setup lang="ts">
  import type { CheckedStrategy, LabelValue, TreeNodeData } from '@sdata/web-vue';

  import { ref } from 'vue';

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

  const treeData: TreeNodeData[] = [
    {
      title: '主干节点 0-0',
      value: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '叶子节点 0-0-1',
          value: '叶子节点 0-0-1',
          key: '0-0-1',
        },
        {
          title: '分支 0-0-2',
          value: '分支 0-0-2',
          key: '0-0-2',
          children: [
            {
              title: '叶子节点 0-0-2-1',
              value: '叶子节点 0-0-2-1',
              key: '0-0-2-1',
            },
          ],
        },
      ],
    },
    {
      title: '主干节点 0-1',
      value: '主干节点 0-1',
      key: '0-1',
      children: [
        {
          title: '分支 0-1-1',
          value: '分支 0-1-1',
          key: '0-1-1',
          checkable: false,
          children: [
            {
              title: '叶子节点 0-1-1-1',
              value: '叶子节点 0-1-1-1',
              key: '0-1-1-1',
            },
            {
              title: '叶子节点 0-1-1-2',
              value: '叶子节点 0-1-1-2',
              key: '0-1-1-2',
              disabled: true,
            },
          ],
        },
        {
          title: '叶子节点 0-1-2',
          value: '叶子节点 0-1-2',
          key: '0-1-2',
        },
      ],
    },
  ];

  const selected = ref<LabelValue[]>([]);
  const treeCheckedStrategy = ref<CheckedStrategy>('all');
</script>
