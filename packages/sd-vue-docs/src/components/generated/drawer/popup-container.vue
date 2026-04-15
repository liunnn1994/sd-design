<template>
  <div>
    <div
      id="parentNode"
      style="
        position: relative;
        width: 100%;
        height: 300px;
        overflow: hidden;
        line-height: 300px;
        text-align: center;
        background-color: var(--color-fill-2);
      "
    >
      <sd-button type="primary" @click="handleClick">Open Drawer</sd-button>
    </div>
  </div>
  <sd-drawer popup-container="#parentNode" :visible="visible" @ok="handleOk" @cancel="handleCancel">
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
