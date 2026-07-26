<template>
  <div class="demo">
    <RichTextEditor
      ref="editorRef"
      v-model="value"
      placeholder="输入标题、段落或带格式的内容"
      :auto-size="{ minRows: 4, maxRows: 10 }"
      @change="syncText"
    />
    <div class="result">纯文本：{{ text || '暂无内容' }}</div>
  </div>
</template>

<script setup lang="ts">
  import type { RichTextEditorInstance, RichTextEditorValue } from '@sdata/web-vue';

  import { shallowRef } from 'vue';

  import { RichTextEditor } from '@sdata/web-vue';

  const editorRef = shallowRef<RichTextEditorInstance>();
  const value = shallowRef<RichTextEditorValue>();
  const text = shallowRef('');

  const syncText = () => {
    text.value = editorRef.value?.getText() ?? '';
  };
</script>

<style scoped>
  .demo {
    display: grid;
    gap: 12px;
  }

  .result {
    color: var(--sd-color-text-2);
  }
</style>
