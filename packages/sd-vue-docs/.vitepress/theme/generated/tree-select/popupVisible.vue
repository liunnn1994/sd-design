<template>
  <div style="margin-bottom: 24px">
    <a-button type="primary" @click="onClick">toggle</a-button>
  </div>
  <a-tree-select
    :popupVisible="popupVisible"
    :allow-clear="true"
    :data="treeData"
    placeholder="Please select ..."
    style="width: 300px"
  ></a-tree-select>
</template>
<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const popupVisible = ref(false);
      function onClick() {
        popupVisible.value = !popupVisible.value;
      }

      return {
        onClick,
        popupVisible,
        treeData,
      };
    },
  };

  const treeData = [
    {
      key: 'node1',
      title: 'Trunk',
      children: [
        {
          key: 'node2',
          title: 'Leaf',
        },
      ],
    },
    {
      key: 'node3',
      title: 'Trunk2',
      children: [
        {
          key: 'node4',
          title: 'Leaf',
        },
        {
          key: 'node5',
          title: 'Leaf',
        },
      ],
    },
  ];
</script>
