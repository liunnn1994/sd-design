<template>
  <div>
    <div class="sd:mb-5">
      <sd-radio-group v-model="align" type="button">
        <sd-radio value="start">起始对齐</sd-radio>
        <sd-radio value="center">居中</sd-radio>
        <sd-radio value="end">末端对齐</sd-radio>
        <sd-radio value="baseline">基线对齐</sd-radio>
      </sd-radio-group>
    </div>
    <sd-space :align="align" class="sd:bg-[var(--color-fill-2)] sd:p-2.5">
      <sd-typography-text>间距：</sd-typography-text>
      <sd-button type="primary">项目 2</sd-button>
      <sd-card title="卡片"> 卡片内容 </sd-card>
    </sd-space>
  </div>
</template>
<script setup lang="ts">
  import { shallowRef } from 'vue';

  const align = shallowRef<'start' | 'center' | 'end' | 'baseline'>('center');
</script>
