<template>
  <sd-checkbox-group v-model="custom" :options="['隐藏页头', '隐藏页脚', '隐藏取消按钮']" />
  <div class="sd:mt-5">
    <sd-button type="primary" @click="handleClick">打开抽屉</sd-button>
  </div>
  <sd-drawer
    :width="340"
    :header="!custom.includes('隐藏页头')"
    :footer="!custom.includes('隐藏页脚')"
    :hide-cancel="custom.includes('隐藏取消按钮')"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    unmountOnClose
  >
    <template #header>
      <span>页头和标题</span>
    </template>
    <div> 您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。 </div>
  </sd-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const visible = ref(false);
  const custom = ref<Array<'隐藏页头' | '隐藏页脚' | '隐藏取消按钮'>>([]);

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
