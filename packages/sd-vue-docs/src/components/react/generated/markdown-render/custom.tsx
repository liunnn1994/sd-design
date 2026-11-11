/** @jsxImportSource react */
import type { CodeBlockNodeProps } from '@sdata/web-react';

import {
  Button,
  Alert,
  MarkdownRender,
  Space,
  Tag,
  setCustomComponents,
  removeCustomComponents,
} from '@sdata/web-react';
import { useState } from 'react';
import { createElement, useEffect, useId } from 'react';

function CodeNode({ node }: Pick<CodeBlockNodeProps, 'node'>) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Space direction="vertical" size="medium" fill>
      <Tag color="blue">{node.language || 'text'}</Tag>
      <pre className="markdown-custom-code">{node.code}</pre>
      <Button size="mini" onClick={() => setExpanded((value) => !value)}>
        {expanded ? '收起节点信息' : '查看节点信息'}
      </Button>
      {expanded && (
        <Alert type="info">
          语言：{node.language || 'text'}；代码共 {node.code.split('\n').length} 行。这个信息面板由
          SD Alert 渲染。
        </Alert>
      )}
    </Space>
  );
}

export default function Example() {
  const customId = useId();

  useEffect(() => {
    setCustomComponents(customId, { code_block: CodeNode });
    return () => removeCustomComponents(customId);
  }, [customId]);
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

  return (
    <>
      <MarkdownRender data-v-3968df88="" content={content} customId={customId} final={true} />
      <style>
        {'[data-v-3968df88] .markdown-custom-code {\n  margin: 0;\n  overflow-x: auto;\n}'}
      </style>
    </>
  );
}
