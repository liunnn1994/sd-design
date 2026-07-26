<template>
  <div class="demo">
    <Space wrap>
      <Button @click="editorRef?.formatText('bold')">加粗</Button>
      <Button @click="editorRef?.formatText('italic')">斜体</Button>
      <Button @click="editorRef?.formatText('underline')">下划线</Button>
      <Button @click="editorRef?.undo()">撤销</Button>
      <Button @click="editorRef?.redo()">重做</Button>
      <Button @click="insertTemplate">插入模板</Button>
    </Space>
    <RichTextEditor
      ref="editorRef"
      default-value="选中文字后使用工具栏设置格式。"
      :auto-size="{ minRows: 4, maxRows: 8 }"
    />
  </div>
</template>

<script setup lang="ts">
  import type { RichTextEditorInstance } from '@sdata/web-vue';

  import { shallowRef } from 'vue';

  import { Button, RichTextEditor, Space } from '@sdata/web-vue';

  const editorRef = shallowRef<RichTextEditorInstance>();

  const insertTemplate = () => {
    editorRef.value?.insertText(' [可编程插入的内容] ');
    editorRef.value?.focus();
  };
</script>

<style scoped>
  .demo {
    display: grid;
    gap: 12px;
  }
</style>
