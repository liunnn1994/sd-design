<template>
  <Space direction="vertical" size="medium" fill>
    <MarkdownRender :content="content" render-code-blocks-as-pre final @copy-code="handleCopy" />
    <TypographyParagraph v-if="copied" aria-live="polite">{{ copied }}</TypographyParagraph>
  </Space>
</template>
<script setup lang="ts">
  import { ref } from 'vue';

  import { MarkdownRender, Space, TypographyParagraph } from '@sdata/web-vue';
  const copied = ref('');
  function handleCopy(code: string) {
    copied.value = `已复制：${code}`;
  }
  // 图表和数学沿用上游节点；未配置可选 loader 时显示原有降级状态。
  const content = [
    '## 用代码整理一首词',
    '> 滚滚长江东逝水，浪花淘尽英雄。\n> 青山依旧在，几度夕阳红。',
    '### TypeScript · 诗词数据与检索',
    '```typescript\ninterface Poem {\n  title: string\n  author: string\n  lines: string[]\n}\n\nconst poem: Poem = {\n  title: "临江仙·滚滚长江东逝水",\n  author: "杨慎",\n  lines: ["滚滚长江东逝水，浪花淘尽英雄。", "古今多少事，都付笑谈中。"],\n}\n\nconst matched = poem.lines.filter(line => line.includes("长江"))\nconsole.log(matched)\n```',
    '### JSON · 阅读笔记',
    '```json\n{\n  "title": "临江仙·滚滚长江东逝水",\n  "dynasty": "明",\n  "images": ["长江", "青山", "夕阳", "渔樵", "浊酒"],\n  "finished": true\n}\n```',
    '### Mermaid · 阅读流程',
    '```mermaid\nflowchart LR\n  A[阅读全文] --> B[标记意象]\n  B --> C{整理札记}\n  C --> D[上阕：长江与青山]\n  C --> E[下阕：渔樵与浊酒]\n  D --> F[回看原词]\n  E --> F\n```',
    '### 数学 · 字数统计示意',
    '设第 $i$ 句的字数为 $n_i$，总字数用求和式表示（不计标点）：',
    '$$\nN = \\sum_{i=1}^{m} n_i, \\qquad \\bar{n} = \\frac{N}{m}\n$$',
  ].join('\n\n');
</script>
