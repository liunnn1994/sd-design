<template>
  <sd-tree
    :default-selected-keys="['0-0-1']"
    :fieldNames="{
      key: 'value',
      title: 'label',
      children: 'items',
      icon: 'customIcon',
    }"
    :data="treeData"
  />
</template>
<script setup lang="ts">
  import type { TreeNodeData } from '@sdata/web-vue';

  import { h } from 'vue';

  import { IconDriveFile, IconStar } from '@sdata/web-vue/es/icon/index.js';

  const treeData: TreeNodeData[] = [
    {
      label: '主干节点 0-0',
      value: '0-0',
      items: [
        {
          label: '分支 0-0-2',
          value: '0-0-2',
          selectable: false,
          customIcon: () => h(IconDriveFile),
          items: [
            {
              label: '叶子节点',
              value: '0-0-2-1',
              items: [
                {
                  label: '叶子节点 0-0-2',
                  value: '0-0-2-1-0',
                  items: [
                    {
                      label: '叶子节点',
                      customIcon: () => h(IconStar),
                      value: '0-0-2-1-0-0',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      label: '主干节点 0-1',
      value: '0-1',
      items: [
        {
          label: '分支 0-1-1',
          value: '0-1-1',
          items: [
            {
              label: '叶子节点',
              value: '0-1-1-0',
            },
          ],
        },
      ],
    },
  ];
</script>
