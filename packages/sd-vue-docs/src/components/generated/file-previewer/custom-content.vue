<template>
  <sd-button type="primary" @click="visible = true">自定义预览内容</sd-button>
  <sd-file-previewer
    v-model:visible="visible"
    title="自定义内容"
    type="pdf"
    src="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
  >
    <template #content="{ src, type, status, close }">
      <div class="custom-preview-content">
        <div class="custom-preview-content__meta">
          <sd-tag color="blue">{{ type }}</sd-tag>
          <span>{{ status }}</span>
        </div>
        <p class="custom-preview-content__url">{{ src }}</p>
        <sd-button type="primary" @click="close">关闭预览</sd-button>
      </div>
    </template>
  </sd-file-previewer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const visible = ref(false);
</script>

<style scoped>
  .custom-preview-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: min(560px, 100%);
    padding: 24px;
    color: #1d2129;
    background: #fff;
    border-radius: 8px;
  }

  .custom-preview-content__meta {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .custom-preview-content__url {
    max-width: 100%;
    overflow: hidden;
    color: #4e5969;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
