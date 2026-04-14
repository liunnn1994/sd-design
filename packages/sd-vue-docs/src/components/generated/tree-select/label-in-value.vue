<template>
  <a-tree-select
    :data="treeData"
    :label-in-value="true"
    :default-value="{ value: 'node2', label: 'Leaf' }"
    placeholder="Please select ..."
    style="width: 300px"
    @change="onChange"
  ></a-tree-select>
</template>
<script>
  import { h } from 'vue';

  import { IconCalendar } from '@sdata/web-vue/es/icon/index.js';

  export default {
    setup() {
      function onChange(value) {
        console.log(value);
      }

      return {
        onChange,
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
