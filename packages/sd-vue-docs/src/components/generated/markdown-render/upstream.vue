<template>
  <Space class="markstream-vue" direction="vertical" size="medium" fill>
    <TypographyTitle :heading="3">直接渲染已解析节点</TypographyTitle>
    <PreCodeNode :node="code" :show-line-numbers="true" />
    <TypographyParagraph>字数统计示意：</TypographyParagraph>
    <MathInlineNode :node="math" />
    <TypographyParagraph>
      {{ parsedCount }} 个顶层节点 · 解析标签 {{ tagNames }} · 图标 {{ icon ?? '默认' }}
    </TypographyParagraph>
    <MarkdownRender v-bind="rendererProps" final />
  </Space>
</template>
<script setup lang="ts">
  import type {
    CodeBlockNodeProps,
    MarkdownRenderProps,
    MathInlineNodeProps,
  } from '@sdata/web-vue';

  import {
    MarkdownRender,
    MathInlineNode,
    PreCodeNode,
    Space,
    TypographyParagraph,
    TypographyTitle,
    getLanguageIcon,
    getMarkdown,
    parseMarkdownToStructure,
    tokenizeHtml,
  } from '@sdata/web-vue';
  // 直接使用公开上游组件时保留原行为，不注入 SD 默认节点适配。
  const code: CodeBlockNodeProps['node'] = {
    type: 'code_block',
    language: 'typescript',
    code: 'const poem = {\n  title: "临江仙·滚滚长江东逝水",\n  author: "杨慎",\n  excerpt: "滚滚长江东逝水，浪花淘尽英雄。",\n}',
    raw: '',
  };
  const math: MathInlineNodeProps['node'] = {
    type: 'math_inline',
    content: 'N = \\sum_{i=1}^{m} n_i',
    raw: '',
  };
  // 解析、HTML 工具和配置类型同样从 SD 根入口引入，无需直接依赖 markstream-vue。
  const content = [
    '### 临江仙·滚滚长江东逝水',
    '*明·杨慎*',
    '**滚滚长江东逝水**，浪花淘尽英雄。  \n是非成败转头空。青山依旧在，几度夕阳红。',
    '白发渔樵江渚上，惯看秋月春风。  \n一壶浊酒喜相逢。古今多少事，都付笑谈中。',
    '> 青山依旧在，几度夕阳红。',
    '- 长江：时间\n- 青山：恒常\n- 浊酒：相逢',
  ].join('\n\n');
  const nodes = parseMarkdownToStructure(content, getMarkdown(), { final: true });
  const parsedCount = nodes.length;
  const tagNames = tokenizeHtml('<p><strong>滚滚长江东逝水</strong>，<em>浪花淘尽英雄</em>。</p>')
    .map((token) => token.tagName)
    .filter(Boolean)
    .join('/');
  const icon = getLanguageIcon(code.language) ?? undefined;
  const rendererProps: MarkdownRenderProps = { nodes };
</script>
