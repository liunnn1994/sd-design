<script setup lang="ts">
  import type { TreeNodeData } from '@sdata/web-vue';

  const treeData: TreeNodeData[] = [
    {
      key: 'standard',
      title: '标准 Ellipsis 会在节点文本溢出时测量内容并展示完整文本提示',
      children: [
        {
          key: 'standard-child',
          title: '子节点同样会应用当前 TreeSelect 的省略配置',
        },
      ],
    },
    {
      key: 'performant',
      title: 'Performant Ellipsis 适合大数据量和虚拟滚动场景',
    },
  ];
</script>

<template>
  <sd-space direction="vertical" size="large">
    <div>
      <div class="sd:mb-2 sd:text-sm">默认 Ellipsis</div>
      <sd-tree-select class="sd:w-64" :data="treeData" placeholder="请选择" />
    </div>

    <div>
      <div class="sd:mb-2 sd:text-sm">高性能 Ellipsis</div>
      <sd-tree-select
        class="sd:w-64"
        :data="treeData"
        ellipsis="performant-ellipsis"
        placeholder="请选择"
      />
    </div>

    <div>
      <div class="sd:mb-2 sd:text-sm">关闭 Ellipsis</div>
      <sd-tree-select class="sd:w-64" :data="treeData" :ellipsis="false" placeholder="请选择" />
    </div>
  </sd-space>
</template>
