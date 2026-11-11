/** @jsxImportSource react */
import type {
  CodeBlockNodeProps,
  MarkdownRenderProps,
  MathInlineNodeProps,
} from '@sdata/web-react';

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
} from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
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

  return (
    <>
      <Space className={'markstream-vue'} direction={'vertical'} size={'medium'} fill={true}>
        <TypographyTitle heading={3}>{'直接渲染已解析节点'}</TypographyTitle>
        <PreCodeNode node={code} showLineNumbers={true} />
        <TypographyParagraph>{'字数统计示意：'}</TypographyParagraph>
        <MathInlineNode node={math} />
        <TypographyParagraph>
          {formatValue(parsedCount)}
          {' 个顶层节点 · 解析标签 '}
          {formatValue(tagNames)}
          {' · 图标 '}
          {formatValue(icon ?? '默认')}
        </TypographyParagraph>
        <MarkdownRender {...rendererProps} final={true} />
      </Space>
    </>
  );
}
