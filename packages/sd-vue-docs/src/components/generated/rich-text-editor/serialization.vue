<template>
  <div class="demo">
    <Space wrap>
      <Button @click="loadMarkdown">载入 Markdown</Button>
      <Button @click="showMarkdown">读取 Markdown</Button>
      <Button @click="showHtml">读取 HTML</Button>
    </Space>
    <RichTextEditor ref="editorRef" :auto-size="{ minRows: 6, maxRows: 12 }" />
    <pre class="output">{{ output }}</pre>
  </div>
</template>

<script setup lang="ts">
  import type { RichTextEditorInstance } from '@sdata/web-vue';

  import { shallowRef } from 'vue';

  import { Button, RichTextEditor, Space } from '@sdata/web-vue';

  const editorRef = shallowRef<RichTextEditorInstance>();
  const output = shallowRef('点击按钮查看序列化结果');

  const loadMarkdown = () => {
    editorRef.value?.setMarkdown('# Lexical 富文本\n\n支持 **加粗**、*斜体*、列表和 `行内代码`。');
  };
  const showMarkdown = () => {
    output.value = editorRef.value?.getMarkdown() ?? '';
  };
  const showHtml = () => {
    output.value = editorRef.value?.getHTML() ?? '';
  };
</script>

<style scoped>
  .demo {
    display: grid;
    gap: 12px;
  }

  .output {
    max-height: 180px;
    padding: 12px;
    overflow: auto;
    background: var(--sd-color-fill-1);
    border-radius: 6px;
  }
</style>
