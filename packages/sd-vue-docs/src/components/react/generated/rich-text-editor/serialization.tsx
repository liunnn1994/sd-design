/** @jsxImportSource react */
import type { RichTextEditorInstance } from '@sdata/web-react';

import { Button, RichTextEditor, Space } from '@sdata/web-react';
import { type ComponentRef, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const editorRef = useRef<ComponentRef<typeof RichTextEditor> | null>(null);
  const [output, setOutput] = useState('点击按钮查看序列化结果');
  const loadMarkdown = () => {
    editorRef.current?.setMarkdown(
      '# Lexical 富文本\n\n支持 **加粗**、*斜体*、列表和 `行内代码`。',
    );
  };
  const showMarkdown = () => {
    setOutput(editorRef.current?.getMarkdown() ?? '');
  };
  const showHtml = () => {
    setOutput(editorRef.current?.getHTML() ?? '');
  };

  return (
    <>
      <div data-v-55541cb2="" className={'demo'}>
        <Space data-v-55541cb2="" wrap={true}>
          <Button data-v-55541cb2="" onClick={loadMarkdown}>
            {'载入 Markdown'}
          </Button>
          <Button data-v-55541cb2="" onClick={showMarkdown}>
            {'读取 Markdown'}
          </Button>
          <Button data-v-55541cb2="" onClick={showHtml}>
            {'读取 HTML'}
          </Button>
        </Space>
        <RichTextEditor data-v-55541cb2="" ref={editorRef} autoSize={{ minRows: 6, maxRows: 12 }} />
        <pre data-v-55541cb2="" className={'output'}>
          {formatValue(output)}
        </pre>
      </div>
      <style>
        {
          '\n.demo[data-v-55541cb2] {\n    display: grid;\n    gap: 12px;\n}\n.output[data-v-55541cb2] {\n    max-height: 180px;\n    padding: 12px;\n    overflow: auto;\n    background: var(--sd-color-fill-1);\n    border-radius: 6px;\n}\n'
        }
      </style>
    </>
  );
}
