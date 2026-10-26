<template>
  <sd-button type="primary" @click="handleClick">打开抽屉</sd-button>
  <sd-drawer :visible="visible" :width="500" @ok="handleOk" @cancel="handleCancel" unmountOnClose>
    <template #title> 标题 </template>
    <div class="sd:mb-5"
      >您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。</div
    >
    <sd-button type="primary" @click="handleNestedClick">打开嵌套抽屉</sd-button>
  </sd-drawer>
  <sd-drawer
    :visible="nestedVisible"
    @ok="handleNestedOk"
    @cancel="handleNestedCancel"
    unmountOnClose
  >
    <template #title> 标题 </template>
    <div>您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。</div>
  </sd-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

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
</script>
