<template>
  <sd-result :status="null" title="这里是标题内容" subtitle="这里是副标题内容">
    <template #icon>
      <IconFaceSmileFill />
    </template>
    <template #extra>
      <sd-space>
        <sd-button type="secondary">重试</sd-button>
        <sd-button type="primary">返回</sd-button>
      </sd-space>
    </template>
  </sd-result>
</template>
<script setup lang="ts">
  import { IconFaceSmileFill } from '@sdata/web-vue/es/icon/index.js';
</script>
