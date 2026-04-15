<template>
  <sd-checkbox
    style="marginbottom: 24px"
    v-model="checkStrictly"
    @change="
      () => {
        checkedKeys = [];
      }
    "
  >
    checkStrictly
  </sd-checkbox>
  <sd-tree
    :checkable="true"
    v-model:checked-keys="checkedKeys"
    :check-strictly="checkStrictly"
    :data="treeData"
  />
</template>
<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const checkedKeys = ref([]);
      const checkStrictly = ref(false);

      return {
        checkedKeys,
        checkStrictly,
        treeData,
      };
    },
  };

  const treeData = [
    {
      title: 'Trunk 0-0',
      key: '0-0',
      children: [
        {
          title: 'Leaf',
          key: '0-0-1',
        },
        {
          title: 'Branch 0-0-2',
          key: '0-0-2',
          disabled: true,
          children: [
            {
              title: 'Leaf',
              key: '0-0-2-1',
            },
            {
              title: 'Leaf',
              key: '0-0-2-2',
              disableCheckbox: true,
            },
          ],
        },
      ],
    },
    {
      title: 'Trunk 0-1',
      key: '0-1',
      children: [
        {
          title: 'Branch 0-1-1',
          key: '0-1-1',
          children: [
            {
              title: 'Leaf ',
              key: '0-1-1-1',
            },
            {
              title: 'Leaf ',
              key: '0-1-1-2',
            },
          ],
        },
        {
          title: 'Leaf',
          key: '0-1-2',
        },
      ],
    },
  ];
</script>
