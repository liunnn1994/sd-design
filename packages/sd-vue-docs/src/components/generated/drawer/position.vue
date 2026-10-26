<template>
  <sd-radio-group v-model="position">
    <sd-radio value="top">顶部</sd-radio>
    <sd-radio value="right">右侧</sd-radio>
    <sd-radio value="bottom">底部</sd-radio>
    <sd-radio value="left">左侧</sd-radio>
  </sd-radio-group>
  <div class="sd:mt-5">
    <sd-button type="primary" @click="handleClick">打开抽屉</sd-button>
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
    <template #title> 标题 </template>
    <div>您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。</div>
  </sd-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const visible = ref(false);
  const position = ref<'top' | 'right' | 'bottom' | 'left'>('right');

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
