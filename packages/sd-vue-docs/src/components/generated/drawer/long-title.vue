<template>
  <sd-radio-group v-model="titleTooltipMode">
    <sd-radio value="component">组件 Tooltip</sd-radio>
    <sd-radio value="native">浏览器原生 title</sd-radio>
  </sd-radio-group>
  <div class="sd:mt-5">
    <sd-button type="primary" @click="handleClick">打开抽屉</sd-button>
  </div>
  <sd-drawer
    :width="340"
    :visible="visible"
    :title-ellipsis-tooltip="titleTooltipMode === 'native' ? false : true"
    @ok="handleOk"
    @cancel="handleCancel"
    unmountOnClose
  >
    <template #title>
      这是一个非常非常非常长的抽屉标题，用来演示标题过长时的省略效果与提示模式切换
    </template>
    <div> 您可以根据实际场景自定义抽屉内容。点击确认按钮后，抽屉将立即关闭。 </div>
  </sd-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const visible = ref(false);
  const titleTooltipMode = ref<'component' | 'native'>('component');

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
