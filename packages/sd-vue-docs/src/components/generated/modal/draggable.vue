<template>
  <sd-button @click="handleClick">打开可拖拽对话框</sd-button>
  <sd-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel" draggable>
    <template #title> 标题 </template>
    <div>您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。</div>
  </sd-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

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
</script>
