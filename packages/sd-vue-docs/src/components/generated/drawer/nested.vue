<template>
  <sd-button type="primary" @click="handleClick">Open Drawer</sd-button>
  <sd-drawer :visible="visible" :width="500" @ok="handleOk" @cancel="handleCancel" unmountOnClose>
    <template #title> Title </template>
    <div :style="{ marginBottom: '20px' }"
      >You can customize modal body text by the current situation. This modal will be closed
      immediately once you press the OK button.</div
    >
    <sd-button type="primary" @click="handleNestedClick">Open Nested Drawer</sd-button>
  </sd-drawer>
  <sd-drawer
    :visible="nestedVisible"
    @ok="handleNestedOk"
    @cancel="handleNestedCancel"
    unmountOnClose
  >
    <template #title> Title </template>
    <div
      >You can customize modal body text by the current situation. This modal will be closed
      immediately once you press the OK button.</div
    >
  </sd-drawer>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const visible = ref(false);
      const nestedVisible = ref(false);

      const handleClick = () => {
        visible.value = true;
      };
      const handleOk = () => {
        visible.value = false;
      };
      const handleCancel = () => {
        visible.value = false;
      };
      const handleNestedClick = () => {
        nestedVisible.value = true;
      };
      const handleNestedOk = () => {
        nestedVisible.value = false;
      };
      const handleNestedCancel = () => {
        nestedVisible.value = false;
      };

      return {
        visible,
        nestedVisible,
        handleClick,
        handleOk,
        handleCancel,
        handleNestedClick,
        handleNestedOk,
        handleNestedCancel,
      };
    },
  };
</script>
