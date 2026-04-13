<template>
  <a-button type="primary" @click="handleClick">Confirm</a-button>
</template>

<script>
  import { ref } from 'vue';

  import { Modal } from '@sdata/web-vue';

  export default {
    setup() {
      const handleClick = () => {
        Modal.confirm({
          title: 'Confirm deletion',
          content:
            'Are you sure you want to delete the 3 selected items? Once you press the delete button, the items will be deleted immediately. You can’t undo this action.',
          okButtonProps: {
            status: 'danger',
          },
        });
      };

      return {
        handleClick,
      };
    },
  };
</script>
