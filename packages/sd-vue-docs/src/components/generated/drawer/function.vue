<template>
  <a-button type="primary" @click="handleClick">Open Drawer</a-button>
</template>

<script>
  import { Drawer } from '@sdata/web-vue';

  export default {
    setup() {
      const handleClick = () => {
        Drawer.open({
          title: 'Info Title',
          content: 'This is an info message',
          width: 340,
        });
      };

      return {
        handleClick,
      };
    },
  };
</script>
