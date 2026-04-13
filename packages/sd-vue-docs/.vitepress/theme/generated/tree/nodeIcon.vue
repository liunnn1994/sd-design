<template>
  <a-tree :data="treeData">
    <template #icon>
      <IconStar />
    </template>
  </a-tree>
</template>
<script>
  import { h } from 'vue';
  import { IconStar, IconDriveFile } from '@sd-design/web-vue/es/icon';

  export default {
    components: {
      IconStar
    },
    setup() {
      return {
        treeData,
      };
    },
  };

  const treeData = [
    {
      title: 'Trunk',
      key: 'node1',
      children: [
        {
          title: 'Leaf',
          key: 'node2',
        },
      ],
    },
    {
      title: 'Trunk',
      key: 'node3',
      children: [
        {
          title: 'Leaf',
          key: 'node4',
          icon: () => h(IconDriveFile),
        },
        {
          title: 'Leaf',
          key: 'node5',
          icon: () => h(IconDriveFile),
        },
      ],
    },
  ];
</script>
