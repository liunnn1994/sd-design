<template>
  <a-space direction="vertical" size="large">
    <a-tree-select
      defaultValue="node0"
      :data="treeData"
      placeholder="Please select ..."
      style="width: 300px"
    ></a-tree-select>
    <a-tree-select
      defaultValue="node0"
      :data="treeData"
      :fallback-option="false"
      placeholder="Please select ..."
      style="width: 300px"
    ></a-tree-select>
    <a-tree-select
      defaultValue="node0"
      :data="treeData"
      :fallback-option="fallback"
      placeholder="Please select ..."
      style="width: 300px"
    ></a-tree-select>
    <a-tree-select
      :defaultValue="['node0', 'node2']"
      :data="treeData"
      multiple
      placeholder="Please select ..."
      style="width: 300px"
    ></a-tree-select>
    <a-tree-select
      :defaultValue="['node0', 'node2']"
      :data="treeData"
      :fallback-option="false"
      multiple
      placeholder="Please select ..."
      style="width: 300px"
    ></a-tree-select>
    <a-tree-select
      :default-value="['node0', 'node2']"
      :data="treeData"
      :fallback-option="fallback"
      multiple
      placeholder="Please select ..."
      style="width: 300px"
    ></a-tree-select>
  </a-space>
</template>

<script>
  export default {
    setup() {
      return {
        treeData,
        fallback(key) {
          return {
            key,
            title: `++${key}++`,
          };
        },
      };
    },
  };

  const treeData = [
    {
      key: 'node1',
      title: 'Trunk1',
      children: [
        {
          key: 'node2',
          title: 'Leaf1',
        },
      ],
    },
    {
      key: 'node3',
      title: 'Trunk2',
      children: [
        {
          key: 'node4',
          title: 'Leaf2',
        },
        {
          key: 'node5',
          title: 'Leaf3',
        },
      ],
    },
  ];
</script>
