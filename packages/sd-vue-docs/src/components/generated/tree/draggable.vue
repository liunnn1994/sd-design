<template>
  <sd-checkbox v-model="checked" class="sd:mb-5"> checkable </sd-checkbox>
  <sd-tree
    class="tree-demo"
    draggable
    blockNode
    :checkable="checked"
    :data="treeData"
    @drop="onDrop"
  />
</template>
<script setup lang="ts">
  import type { TreeNodeData, TreeNodeKey } from '@sdata/web-vue';

  import { ref } from 'vue';

  const defaultTreeData = [
    {
      title: '主干节点 0-0',
      key: '0-0',
      children: [
        {
          title: '叶子节点 0-0-1',
          key: '0-0-1',
        },
        {
          title: '分支 0-0-2',
          key: '0-0-2',
          disableCheckbox: true,
          children: [
            {
              draggable: false,
              title: '叶子节点 0-0-2-1（禁止拖拽）',
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
          checkable: false,
          children: [
            {
              title: '叶子节点 0-1-1-1',
              key: '0-1-1-1',
            },
            {
              title: '叶子节点 0-1-1-2',
              key: '0-1-1-2',
            },
          ],
        },
        {
          title: '叶子节点 0-1-2',
          key: '0-1-2',
        },
      ],
    },
  ];

  const treeData = ref<TreeNodeData[]>(defaultTreeData);
  const checkedKeys = ref<TreeNodeKey[]>([]);
  const checked = ref(false);

  function onDrop({
    dragNode,
    dropNode,
    dropPosition,
  }: {
    dragNode: TreeNodeData;
    dropNode: TreeNodeData;
    dropPosition: number;
  }) {
    const data = treeData.value;
    const loop = (
      data: TreeNodeData[],
      key: TreeNodeKey,
      callback: (item: TreeNodeData, index: number, arr: TreeNodeData[]) => void,
    ) => {
      data.some((item, index, arr) => {
        if (item.key === key) {
          callback(item, index, arr);
          return true;
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
        return false;
      });
    };

    loop(data, dragNode.key ?? '', (_, index, arr) => {
      arr.splice(index, 1);
    });

    if (dropPosition === 0) {
      loop(data, dropNode.key ?? '', (item) => {
        item.children = item.children || [];
        item.children.push(dragNode);
      });
    } else {
      loop(data, dropNode.key ?? '', (_, index, arr) => {
        arr.splice(dropPosition < 0 ? index : index + 1, 0, dragNode);
      });
    }
  }
</script>
<style scoped>
  .tree-demo :deep(.tree-node-dropover > .sd-tree-node-title),
  .tree-demo :deep(.tree-node-dropover > .sd-tree-node-title:hover) {
    animation: blinkBg 0.4s 2;
  }

  @keyframes blinkBg {
    0% {
      background-color: transparent;
    }

    100% {
      background-color: var(--color-primary-light-1);
    }
  }
</style>
