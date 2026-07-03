<template>
  <sd-button type="primary" @click="visible = true">预览图片</sd-button>
  <sd-file-previewer
    v-model:visible="visible"
    title="图片预览"
    src="https://picsum.photos/id/10/1000/1000?t=file-previewer-basic"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const visible = ref(false);
</script>
