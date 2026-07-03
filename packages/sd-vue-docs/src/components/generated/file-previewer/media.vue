<template>
  <sd-space>
    <sd-button type="primary" @click="openPreview('video')">预览视频</sd-button>
    <sd-button @click="openPreview('audio')">预览音频</sd-button>
    <sd-button @click="openPreview('pdf')">预览 PDF</sd-button>
  </sd-space>
  <sd-file-previewer
    v-model:visible="visible"
    :src="currentFile.src"
    :type="currentFile.type"
    :title="currentFile.title"
  />
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';

  type FileKey = 'video' | 'audio' | 'pdf';

  const visible = ref(false);
  const current = ref<FileKey>('video');
  const files = {
    video: {
      title: '视频预览',
      src: 'https://developer.mozilla.org/shared-assets/videos/flower.webm',
      type: 'video',
    },
    audio: {
      title: '音频预览',
      src: 'https://developer.mozilla.org/shared-assets/audio/t-rex-roar.mp3',
      type: 'audio',
    },
    pdf: {
      title: 'PDF 预览',
      src: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
      type: 'pdf',
    },
  } as const;

  const currentFile = computed(() => files[current.value]);

  function openPreview(type: FileKey) {
    current.value = type;
    visible.value = true;
  }
</script>
