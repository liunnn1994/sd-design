/** @jsxImportSource react */
import type { RichTextEditorInstance, RichTextEditorValue } from '@sdata/web-react';

import { RichTextEditor } from '@sdata/web-react';
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
  const [value, setValue] = useState<RichTextEditorValue | undefined>(undefined);
  const [text, setText] = useState('');
  const syncText = () => {
    setText(editorRef.current?.getText() ?? '');
  };

  return (
    <>
      <div data-v-5c4e81cd="" className={'demo'}>
        <RichTextEditor
          data-v-5c4e81cd=""
          ref={editorRef}
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          placeholder={'输入标题、段落或带格式的内容'}
          autoSize={{ minRows: 4, maxRows: 10 }}
          onChange={syncText}
        />
        <div data-v-5c4e81cd="" className={'result'}>
          {'纯文本：'}
          {formatValue(text || '暂无内容')}
        </div>
      </div>
      <style>
        {
          '\n.demo[data-v-5c4e81cd] {\n    display: grid;\n    gap: 12px;\n}\n.result[data-v-5c4e81cd] {\n    color: var(--sd-color-text-2);\n}\n'
        }
      </style>
    </>
  );
}
