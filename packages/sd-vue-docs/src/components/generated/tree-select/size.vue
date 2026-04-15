<template>
  <div style="margin-bottom: 20px">
    <sd-radio-group v-model="size" type="button">
      <sd-radio value="mini">mini</sd-radio>
      <sd-radio value="small">small</sd-radio>
      <sd-radio value="medium">medium</sd-radio>
      <sd-radio value="large">large</sd-radio>
    </sd-radio-group>
  </div>
  <sd-tree-select
    defaultValue="node1"
    :size="size"
    :data="treeData"
    placeholder="Please select ..."
    style="width: 300px"
  ></sd-tree-select>
</template>
<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const size = ref('medium');

      return {
        size,
        treeData,
      };
    },
  };

  const treeData = [
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
