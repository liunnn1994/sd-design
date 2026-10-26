<template>
  <sd-button @click="handleClick">打开对话框</sd-button>
  <sd-modal
    v-model:visible="visible"
    @cancel="handleCancel"
    :on-before-ok="handleBeforeOk"
    unmountOnClose
  >
    <template #title> 标题 </template>
    <div>您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。 </div>
  </sd-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const visible = ref(false);

  const handleClick = () => {
    visible.value = true;
  };
  const handleBeforeOk = async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return true;
    // prevent close
    // return false;
  };
  const handleCancel = () => {
    visible.value = false;
  };
</script>
