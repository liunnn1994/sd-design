<template>
  <sd-button type="primary" @click="visible = true">自定义标题</sd-button>
  <sd-file-previewer
    v-model:visible="visible"
    type="audio"
    src="https://developer.mozilla.org/shared-assets/audio/t-rex-roar.mp3"
  >
    <template #title>
      <sd-space size="mini">自定义标题 <sd-tag color="blue">Audio</sd-tag></sd-space>
    </template>
  </sd-file-previewer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const visible = ref(false);
</script>
