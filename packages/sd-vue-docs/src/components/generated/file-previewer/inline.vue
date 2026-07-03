<template>
  <sd-space class="inline-preview-demo__actions">
    <sd-button
      v-for="file in files"
      :key="file.type"
      :type="file.type === current ? 'primary' : 'secondary'"
      @click="current = file.type"
    >
      {{ file.label }}
    </sd-button>
  </sd-space>
  <div class="inline-preview-demo">
    <sd-file-previewer
      :fullscreen="false"
      :src="currentFile.src"
      :title="currentFile.title"
      :type="currentFile.type"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';

  type PreviewType = 'image' | 'video' | 'audio' | 'pdf';

  const files = [
    {
      label: '图片',
      title: '内嵌图片预览',
      type: 'image',
      src: 'https://picsum.photos/id/11/1000/640?t=file-previewer-inline-image',
    },
    {
      label: '视频',
      title: '内嵌视频预览',
      type: 'video',
      src: 'https://developer.mozilla.org/shared-assets/videos/flower.webm',
    },
    {
      label: '音频',
      title: '内嵌音频预览',
      type: 'audio',
      src: 'https://developer.mozilla.org/shared-assets/audio/t-rex-roar.mp3',
    },
    {
      label: 'PDF',
      title: '内嵌 PDF 预览',
      type: 'pdf',
      src: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    },
  ] as const;

  const current = ref<PreviewType>('image');
  const currentFile = computed(() => files.find((file) => file.type === current.value) ?? files[0]);
</script>

<style scoped>
  .inline-preview-demo__actions {
    margin-bottom: 12px;
  }

  .inline-preview-demo {
    width: 100%;
    height: 360px;
  }
</style>
