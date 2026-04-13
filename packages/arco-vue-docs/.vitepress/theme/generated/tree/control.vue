<template>
  <a-button-group style="margin-bottom: 20px;">
    <a-button
      type="primary"
      @click="toggleChecked"
    >
      {{
        checkedKeys?.length ? 'deselect all' : 'select all'
      }}
    </a-button>
    <a-button
      type="primary"
      @click="toggleExpanded"
    >
      {{
        expandedKeys?.length ? 'fold' : 'unfold'
      }}
    </a-button>
  </a-button-group>
  <a-tree
    :checkable="true"
    v-model:selected-keys="selectedKeys"
    v-model:checked-keys="checkedKeys"
    v-model:expanded-keys="expandedKeys"
    @select="onSelect"
    @check="onCheck"
    @expand="onExpand"
    :data="treeData"
  />
</template>
<script>
  import { ref } from 'vue';

  const allCheckedKeys = ['0-0', '0-0-1', '0-0-2', '0-0-2-1', '0-1', '0-1-1', '0-1-2'];
  const allExpandedKeys = ['0-0', '0-1', '0-0-2'];


  export default {
    setup() {
      const selectedKeys = ref([]);
      const checkedKeys = ref([]);
      const expandedKeys = ref([]);


      return {
        selectedKeys,
        checkedKeys,
        expandedKeys,
        treeData,
        toggleChecked() {
          checkedKeys.value = checkedKeys?.value.length ? [] : allCheckedKeys;
        },
        toggleExpanded() {
          expandedKeys.value = expandedKeys?.value.length ? [] : allExpandedKeys;
        },
        onSelect(newSelectedKeys, event) {
          console.log('select: ', newSelectedKeys, event);
        },
        onCheck(newCheckedKeys, event) {
          console.log('check: ', newCheckedKeys, event);
        },
        onExpand(newExpandedKeys, event) {
          console.log('expand: ', newExpandedKeys, event);
        },
      };
    },
  };

  const treeData = [
    {
      title: 'Trunk 0-0',
      key: '0-0',
      children: [
        {
          title: 'Leaf 0-0-1',
          key: '0-0-1',
        },
        {
          title: 'Branch 0-0-2',
          key: '0-0-2',
          children: [
            {
              title: 'Leaf 0-0-2-1',
              key: '0-0-2-1'
            }
          ]
        },
      ],
    },
    {
      title: 'Trunk 0-1',
      key: '0-1',
      children: [
        {
          title: 'Leaf 0-1-1',
          key: '0-1-1',
        },
        {
          title: 'Leaf 0-1-2',
          key: '0-1-2',
        },
      ],
    },
  ];
</script>
