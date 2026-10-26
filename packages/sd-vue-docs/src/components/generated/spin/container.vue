<template>
  <sd-spin :loading="loading" tip="加载可能需要一些时间，请稍候…">
    <sd-card title="SD 卡片">
      SD Design
      是一套面向数据工具与企业应用的组件库，提供统一的设计语言和丰富的交互组件，帮助团队高效构建清晰、易用的产品界面。
    </sd-card>
  </sd-spin>
</template>

<script setup lang="ts">
  import { shallowRef } from 'vue';

  const loading = shallowRef(true);
</script>
