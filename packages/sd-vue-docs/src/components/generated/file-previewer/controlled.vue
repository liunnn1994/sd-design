<template>
  <sd-button type="primary" @click="visible = true">打开受控预览</sd-button>
  <sd-file-previewer
    v-model:visible="visible"
    title="受控预览"
    type="pdf"
    src="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
    @close="closedCount += 1"
  />
  <span class="sd:ml-2">关闭次数：{{ closedCount }}</span>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const visible = ref(false);
  const closedCount = ref(0);
</script>
