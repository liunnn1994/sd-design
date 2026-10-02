<template><MarkdownRender :content="content" :custom-id="customId" final /></template>
<script setup lang="ts">
  import type { CodeBlockNodeProps } from '@sdata/web-vue';

  import { defineComponent, h, onBeforeUnmount, ref, useId } from 'vue';

  import {
    Button,
    Alert,
    MarkdownRender,
    Space,
    Tag,
    setCustomComponents,
    removeCustomComponents,
  } from '@sdata/web-vue';
  const customId = useId();
  // 所有组件、注册函数和节点类型均从 SD 包引入，使用实例独立的映射。
  const CodeNode = defineComponent({
    props: ['node'],
    setup(props) {
      const expanded = ref(false);
      return () => {
        const node = props.node as CodeBlockNodeProps['node'];
        return h(Space, { direction: 'vertical', size: 'medium', fill: true }, () => [
          h(Tag, { color: 'blue' }, () => node.language || 'text'),
          h('pre', { class: 'markdown-custom-code' }, node.code),
          h(
            Button,
            {
              size: 'mini',
              onClick: () => {
                expanded.value = !expanded.value;
              },
            },
            () => (expanded.value ? '收起节点信息' : '查看节点信息'),
          ),
          expanded.value
            ? h(
                Alert,
                { type: 'info' },
                () =>
                  `语言：${node.language || 'text'}；代码共 ${node.code.split('\n').length} 行。这个信息面板由 SD Alert 渲染。`,
              )
            : null,
        ]);
      };
    },
  });
  setCustomComponents(customId, { code_block: CodeNode });
  onBeforeUnmount(() => removeCustomComponents(customId));
  const content = [
    '## 自定义诗词数据节点',
    '**临江仙·滚滚长江东逝水** · *明·杨慎*',
    '> 滚滚长江东逝水，浪花淘尽英雄。\n> 是非成败转头空。青山依旧在，几度夕阳红。',
    '以下代码块使用同一份自定义映射；语言标签、操作按钮和展开信息均由 SD 组件组成。',
    '```typescript\nconst poem = {\n  title: "临江仙·滚滚长江东逝水",\n  author: "杨慎",\n  excerpt: "古今多少事，都付笑谈中。",\n}\n```',
    '### 另一种语言，沿用同一个节点组件',
    '```json\n{\n  "images": ["长江", "青山", "夕阳"],\n  "notes": "青山依旧在，几度夕阳红。"\n}\n```',
    '普通段落、**加粗**、*斜体*和 [链接](https://example.com) 继续使用默认适配，不受代码节点覆盖影响。',
  ].join('\n\n');
</script>
<style scoped lang="scss">
  :deep(.markdown-custom-code) {
    margin: 0;
    overflow-x: auto;
  }
</style>
