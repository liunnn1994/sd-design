<template>
  <a-tree-select
    :data="treeData"
    v-model="selected"
    placeholder="Please select ..."
    style="width: 300px"
  ></a-tree-select>
</template>
<script>
  import { h, ref } from 'vue';
  import { IconCalendar } from '@sdata/web-vue/es/icon/index.js';

  export default {
    setup() {
      const selected = ref('node2');

      return {
        selected,
        treeData,
      };
    },
  };

  const treeData = [
    {
      key: 'node1',
      icon: () => h(IconCalendar),
      title: 'Trunk',
      disabled: true,
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
      icon: () => h(IconCalendar),
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
