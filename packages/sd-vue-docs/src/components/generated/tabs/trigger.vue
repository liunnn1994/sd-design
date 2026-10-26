<template>
  <div class="sd:grid sd:gap-4">
    <sd-radio-group v-model="trigger">
      <sd-radio value="click">点击</sd-radio>
      <sd-radio value="hover">悬停</sd-radio>
    </sd-radio-group>
    <sd-tabs default-active-key="1" :trigger="trigger">
      <sd-tab-pane key="1" title="标签页 1"> 标签页面板内容 1 </sd-tab-pane>
      <sd-tab-pane key="2" title="标签页 2"> 标签页面板内容 2 </sd-tab-pane>
      <sd-tab-pane key="3">
        <template #title>标签页 3</template>
        标签页面板内容 3
      </sd-tab-pane>
    </sd-tabs>
  </div>
</template>

<script setup lang="ts">
  import type { TabTriggerEvent } from '@sdata/web-vue';

  import { ref } from 'vue';

  const trigger = ref<TabTriggerEvent>('click');
</script>
