/** @jsxImportSource react */
import type { RichTextEditorInstance, RichTextEditorPlugin } from '@sdata/web-react';

import { Alert, RichTextEditor } from '@sdata/web-react';
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
  const [updateCount, setUpdateCount] = useState(0);
  const updateCounterPlugin: RichTextEditorPlugin = (editor) =>
    editor.registerUpdateListener(() => {
      setUpdateCount((previous) => previous + 1);
    });

  return (
    <>
      <div data-v-97565434="" className={'demo'}>
        <Alert data-v-97565434="" type={'info'}>
          {' 下方状态由原始 LexicalEditor 的 registerUpdateListener 直接维护。 '}
        </Alert>
        <RichTextEditor
          data-v-97565434=""
          ref={editorRef}
          defaultValue={'输入内容，观察原始 Lexical 更新次数。'}
          plugins={[updateCounterPlugin]}
        />
        <div data-v-97565434="">
          {'Lexical 更新次数：'}
          {formatValue(updateCount)}
        </div>
      </div>
      <style>{'\n.demo[data-v-97565434] {\n    display: grid;\n    gap: 12px;\n}\n'}</style>
    </>
  );
}
