<template>
  <div class="demo">
    <Alert type="info"> 下方状态由原始 LexicalEditor 的 registerUpdateListener 直接维护。 </Alert>
    <RichTextEditor
      ref="editorRef"
      default-value="输入内容，观察原始 Lexical 更新次数。"
      :plugins="[updateCounterPlugin]"
    />
    <div>Lexical 更新次数：{{ updateCount }}</div>
  </div>
</template>

<script setup lang="ts">
  import type { RichTextEditorInstance, RichTextEditorPlugin } from '@sdata/web-vue';

  import { shallowRef } from 'vue';

  import { Alert, RichTextEditor } from '@sdata/web-vue';

  const editorRef = shallowRef<RichTextEditorInstance>();
  const updateCount = shallowRef(0);

  const updateCounterPlugin: RichTextEditorPlugin = (editor) =>
    editor.registerUpdateListener(() => {
      updateCount.value += 1;
    });
</script>

<style scoped>
  .demo {
    display: grid;
    gap: 12px;
  }
</style>
