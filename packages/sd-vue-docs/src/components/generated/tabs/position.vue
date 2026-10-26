<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group v-model="position" type="button">
      <sd-radio value="top">顶部</sd-radio>
      <sd-radio value="right">右侧</sd-radio>
      <sd-radio value="bottom">底部</sd-radio>
      <sd-radio value="left">左侧</sd-radio>
    </sd-radio-group>
    <sd-tabs :position="position">
      <sd-tab-pane key="1" title="标签页 1"> 标签页面板内容 1 </sd-tab-pane>
      <sd-tab-pane key="2" title="标签页 2"> 标签页面板内容 2 </sd-tab-pane>
      <sd-tab-pane key="3" title="标签页 3"> 标签页面板内容 3 </sd-tab-pane>
    </sd-tabs>
  </sd-space>
</template>

<script setup lang="ts">
  import type { TabsPosition } from '@sdata/web-vue';

  import { ref } from 'vue';

  const position = ref<TabsPosition>('top');
</script>
