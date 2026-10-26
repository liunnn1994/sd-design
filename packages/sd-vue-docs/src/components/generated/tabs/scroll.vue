<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group v-model="position" type="button">
      <sd-radio value="left">左侧</sd-radio>
      <sd-radio value="top">顶部</sd-radio>
      <sd-radio value="right">右侧</sd-radio>
      <sd-radio value="bottom">底部</sd-radio>
    </sd-radio-group>
    <sd-radio-group v-model="scrollPosition" type="button">
      <sd-radio value="auto">自动</sd-radio>
      <sd-radio value="start">起始对齐</sd-radio>
      <sd-radio value="center">居中</sd-radio>
      <sd-radio value="end">末端对齐</sd-radio>
    </sd-radio-group>
    <sd-button @click="changeActive"> 切换： {{ activeKey }}</sd-button>
  </sd-space>
  <sd-tabs
    v-model:activeKey="activeKey"
    :position="position"
    :scrollPosition="scrollPosition"
    class="sd:w-full sd:h-75 sd:mt-5"
  >
    <sd-tab-pane v-for="tab in tabs" :key="tab.key" :title="tab.title">
      {{ tab.content }}
    </sd-tab-pane>
  </sd-tabs>
</template>

<script setup lang="ts">
  import type { ScrollPosition, TabsPosition } from '@sdata/web-vue';

  import { ref } from 'vue';

  const position = ref<TabsPosition>('top');
  const scrollPosition = ref<ScrollPosition>('auto');
  const activeKey = ref('Tab1');
  const tabs = Array.from({ length: 30 }, (v, i) => {
    return {
      key: `Tab${i + 1}`,
      title: `标签页 ${i + 1}`,
      content: `标签页面板内容 ${i + 1}`,
    };
  });

  const changeActive = () => {
    activeKey.value = `Tab${Math.floor(Math.random() * 30) + 1}`;
  };
</script>
