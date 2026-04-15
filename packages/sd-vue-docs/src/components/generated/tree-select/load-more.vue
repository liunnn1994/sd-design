<template>
  <sd-tree-select
    :data="treeData"
    :load-more="loadMore"
    placeholder="Please select ..."
    style="width: 300px"
  ></sd-tree-select>
</template>
<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const treeData = ref(defaultTreeData);
      const loadMore = (nodeData) => {
        const { title, key } = nodeData;
        const children = [
          { title: `${title}-0`, value: `${title}-0`, key: `${key}-0` },
          { title: `${title}-1`, value: `${title}-1`, key: `${key}-1` },
        ];

        return new Promise((resolve) => {
          setTimeout(() => {
            nodeData.children = children;
            resolve();
          }, 1000);
        });
      };

      return {
        treeData,
        loadMore,
      };
    },
  };

  const defaultTreeData = [
    {
      key: 'node1',
      title: 'node1',
      disabled: true,
      children: [
        {
          key: 'node2',
          title: 'node2',
        },
      ],
    },
    {
      key: 'node3',
      title: 'node3',
      children: [
        {
          key: 'node4',
          title: 'node4',
          isLeaf: true,
        },
        {
          key: 'node5',
          title: 'node5',
          isLeaf: true,
        },
      ],
    },
  ];
</script>
