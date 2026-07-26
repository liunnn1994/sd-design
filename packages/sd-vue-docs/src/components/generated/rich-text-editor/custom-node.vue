<template>
  <div class="demo">
    <Button @click="insertMention">插入自定义 Mention 节点</Button>
    <RichTextEditor ref="editorRef" default-value="参与人：">
      <template #node-mention="{ node, update, remove }">
        <Tag color="arcoblue" closable @close="remove">
          <span @click="update(node.value === '张三' ? '李四' : '张三')"> @{{ node.value }} </span>
        </Tag>
      </template>
    </RichTextEditor>
  </div>
</template>

<script setup lang="ts">
  import type { RichTextEditorInstance } from '@sdata/web-vue';

  import { shallowRef } from 'vue';

  import { Button, RichTextEditor, Tag } from '@sdata/web-vue';

  const editorRef = shallowRef<RichTextEditorInstance>();
  let sequence = 0;

  const insertMention = () => {
    editorRef.value?.insertComponent({
      key: `mention-${++sequence}`,
      name: 'mention',
      value: '张三',
      textValue: '@张三',
    });
  };
</script>

<style scoped>
  .demo {
    display: grid;
    gap: 12px;
  }
</style>
