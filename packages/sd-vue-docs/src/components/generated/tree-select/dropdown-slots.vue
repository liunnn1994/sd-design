<template>
  <div class="sd:grid sd:gap-4">
    <sd-form layout="inline" :model="form">
      <sd-form-item label="空状态">
        <sd-switch v-model="form.empty" />
      </sd-form-item>
      <sd-form-item label="showHeaderOnEmpty">
        <sd-switch v-model="form.showHeaderOnEmpty" />
      </sd-form-item>
      <sd-form-item label="showFooterOnEmpty">
        <sd-switch v-model="form.showFooterOnEmpty" />
      </sd-form-item>
    </sd-form>
    <sd-tree-select
      class="sd:w-75"
      placeholder="请选择…"
      :data="computedTreeData"
      :show-header-on-empty="form.showHeaderOnEmpty"
      :show-footer-on-empty="form.showFooterOnEmpty"
    >
      <template #header>
        <div class="sd:py-1.5 sd:px-3">
          <sd-checkbox value="1">全部</sd-checkbox>
        </div>
      </template>
      <template #footer>
        <div class="sd:py-1.5 sd:text-center">
          <sd-button>点击我</sd-button>
        </div>
      </template>
    </sd-tree-select>
  </div>
</template>
<script setup lang="ts">
  import type { TreeNodeData } from '@sdata/web-vue';

  import { computed, h, reactive } from 'vue';

  import { IconCalendar } from '@sdata/web-vue/es/icon/index.js';

  const form = reactive({
    empty: false,
    showHeaderOnEmpty: false,
    showFooterOnEmpty: false,
  });

  const treeData: TreeNodeData[] = [
    {
      key: 'node1',
      icon: () => h(IconCalendar),
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
    {
      key: 'node6',
      title: '主干节点 3',
      icon: () => h(IconCalendar),
      children: [
        {
          key: 'node7',
          title: '叶子节点',
        },
        {
          key: 'node8',
          title: '叶子节点',
        },
      ],
    },
  ];

  const computedTreeData = computed(() => {
    return form.empty ? [] : treeData;
  });
</script>
