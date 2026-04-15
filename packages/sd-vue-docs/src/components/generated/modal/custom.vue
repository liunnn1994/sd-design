<template>
  <sd-button @click="handleClick">Open Modal</sd-button>
  <sd-modal
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    okText="Confirm"
    cancelText="Exit"
    unmountOnClose
  >
    <template #title> Title </template>
    <div
      >You can customize modal body text by the current situation. This modal will be closed
      immediately once you press the OK button.</div
    >
  </sd-modal>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const visible = ref(false);

      const handleClick = () => {
        visible.value = true;
      };
      const handleOk = () => {
        visible.value = false;
      };
      const handleCancel = () => {
        visible.value = false;
      };

      return {
        visible,
        handleClick,
        handleOk,
        handleCancel,
      };
    },
  };
</script>
