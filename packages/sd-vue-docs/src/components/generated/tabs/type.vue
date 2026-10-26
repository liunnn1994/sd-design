<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group v-model="type" type="button">
      <sd-radio value="line">线形</sd-radio>
      <sd-radio value="card">卡片</sd-radio>
      <sd-radio value="card-gutter">卡片间距</sd-radio>
      <sd-radio value="text">文本</sd-radio>
      <sd-radio value="rounded">圆角</sd-radio>
      <sd-radio value="capsule">胶囊</sd-radio>
    </sd-radio-group>
    <sd-radio-group v-model="size" type="button">
      <sd-radio value="mini">迷你</sd-radio>
      <sd-radio value="small">小</sd-radio>
      <sd-radio value="medium">中</sd-radio>
      <sd-radio value="large">大</sd-radio>
    </sd-radio-group>
    <sd-tabs :type="type" :size="size">
      <sd-tab-pane key="1" title="标签页 1"> 标签页面板内容 1 </sd-tab-pane>
      <sd-tab-pane key="2" title="标签页 2"> 标签页面板内容 2 </sd-tab-pane>
      <sd-tab-pane key="3" title="标签页 3"> 标签页面板内容 3 </sd-tab-pane>
    </sd-tabs>
  </sd-space>
</template>

<script setup lang="ts">
  import type { TabsType } from '@sdata/web-vue';

  import { ref } from 'vue';

  const type = ref<TabsType>('line');
  const size = ref<'mini' | 'small' | 'medium' | 'large'>('medium');
</script>
