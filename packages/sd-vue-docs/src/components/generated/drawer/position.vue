<template>
  <sd-radio-group v-model="position">
    <sd-radio value="top">Top</sd-radio>
    <sd-radio value="right">Right</sd-radio>
    <sd-radio value="bottom">Bottom</sd-radio>
    <sd-radio value="left">Left</sd-radio>
  </sd-radio-group>
  <div :style="{ marginTop: '20px' }">
    <sd-button type="primary" @click="handleClick">Open Drawer</sd-button>
  </div>
  <sd-drawer
    :width="340"
    :height="340"
    :visible="visible"
    :placement="position"
    @ok="handleOk"
    @cancel="handleCancel"
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
      const position = ref('right');

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
        position,
        handleClick,
        handleOk,
        handleCancel,
      };
    },
  };
</script>
