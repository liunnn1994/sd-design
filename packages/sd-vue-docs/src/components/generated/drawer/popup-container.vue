<template>
  <div>
    <div
      id="parentNode"
      class="sd:relative sd:h-[300px] sd:w-full sd:overflow-hidden sd:bg-[var(--color-fill-2)] sd:text-center sd:leading-[300px]"
    >
      <sd-button type="primary" @click="handleClick">打开抽屉</sd-button>
    </div>
  </div>
  <sd-drawer popup-container="#parentNode" :visible="visible" @ok="handleOk" @cancel="handleCancel">
    <template #title> 标题 </template>
    <div>您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。</div>
  </sd-drawer>
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
