<template>
  <div class="demo">
    <Space wrap>
      <Button @click="insertInput">插入 Input</Button>
      <Button @click="insertSelect">插入 Select</Button>
      <Button @click="insertTag">插入 Tag</Button>
    </Space>
    <RichTextEditor
      ref="editorRef"
      default-value="这段内容中可以插入组件库控件："
      :auto-size="{ minRows: 4, maxRows: 8 }"
    />
  </div>
</template>

<script setup lang="ts">
  import type { RichTextEditorInstance } from '@sdata/web-vue';

  import { shallowRef } from 'vue';

  import { Button, RichTextEditor, Space } from '@sdata/web-vue';

  const editorRef = shallowRef<RichTextEditorInstance>();
  let sequence = 0;

  const insertInput = () => {
    editorRef.value?.insertComponent({
      key: `input-${++sequence}`,
      name: 'input',
      value: '关键词',
      props: { placeholder: '请输入关键词' },
      textValue: '关键词',
    });
  };

  const insertSelect = () => {
    editorRef.value?.insertComponent({
      key: `select-${++sequence}`,
      name: 'select',
      value: 'Vue',
      props: { options: ['Vue', 'React', 'Svelte'] },
      textValue: 'Vue',
    });
  };

  const insertTag = () => {
    editorRef.value?.insertComponent({
      key: `tag-${++sequence}`,
      name: 'tag',
      value: '重要',
      props: { label: '重要', color: 'orangered', closable: true },
      textValue: '重要',
    });
  };
</script>

<style scoped>
  .demo {
    display: grid;
    gap: 12px;
  }
</style>
