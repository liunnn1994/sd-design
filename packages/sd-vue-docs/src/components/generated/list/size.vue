<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group v-model="size" type="button">
      <sd-radio value="small">小</sd-radio>
      <sd-radio value="medium">中</sd-radio>
      <sd-radio value="large">大</sd-radio>
    </sd-radio-group>
    <sd-list :size="size">
      <template #header> 列表标题 </template>
      <sd-list-item>示例科技有限公司</sd-list-item>
      <sd-list-item>示例科技研发中心</sd-list-item>
      <sd-list-item>示例数据有限公司</sd-list-item>
      <sd-list-item>示例云服务有限公司</sd-list-item>
      <sd-list-item>示例科技北京分公司</sd-list-item>
    </sd-list>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const size = ref<'small' | 'medium' | 'large'>('medium');
</script>
