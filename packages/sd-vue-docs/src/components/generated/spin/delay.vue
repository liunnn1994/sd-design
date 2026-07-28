<template>
  <sd-space direction="vertical">
    <sd-button @click="loading = !loading">
      {{ loading ? '结束加载' : '开始加载' }}
    </sd-button>
    <sd-spin :loading="loading" :delay="true" tip="加载超过 400ms 后显示">
      <sd-card title="延迟加载">
        短于 400ms 的加载过程不会显示遮罩，可避免快速请求造成的闪烁。
      </sd-card>
    </sd-spin>
  </sd-space>
</template>

<script setup lang="ts">
  import { shallowRef } from 'vue';

  const loading = shallowRef(false);
</script>
