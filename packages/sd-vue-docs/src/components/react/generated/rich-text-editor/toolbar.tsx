/** @jsxImportSource react */
import type { RichTextEditorInstance } from '@sdata/web-react';

import { Button, RichTextEditor, Space } from '@sdata/web-react';
import { type ComponentRef, useRef } from 'react';

export default function Example() {
  const editorRef = useRef<ComponentRef<typeof RichTextEditor> | null>(null);
  const insertTemplate = () => {
    editorRef.current?.insertText(' [可编程插入的内容] ');
    editorRef.current?.focus();
  };

  return (
    <>
      <div data-v-5bb4b474="" className={'demo'}>
        <Space data-v-5bb4b474="" wrap={true}>
          <Button
            data-v-5bb4b474=""
            onClick={() => {
              editorRef.current?.formatText('bold');
            }}
          >
            {'加粗'}
          </Button>
          <Button
            data-v-5bb4b474=""
            onClick={() => {
              editorRef.current?.formatText('italic');
            }}
          >
            {'斜体'}
          </Button>
          <Button
            data-v-5bb4b474=""
            onClick={() => {
              editorRef.current?.formatText('underline');
            }}
          >
            {'下划线'}
          </Button>
          <Button
            data-v-5bb4b474=""
            onClick={() => {
              editorRef.current?.undo();
            }}
          >
            {'撤销'}
          </Button>
          <Button
            data-v-5bb4b474=""
            onClick={() => {
              editorRef.current?.redo();
            }}
          >
            {'重做'}
          </Button>
          <Button data-v-5bb4b474="" onClick={insertTemplate}>
            {'插入模板'}
          </Button>
        </Space>
        <RichTextEditor
          data-v-5bb4b474=""
          ref={editorRef}
          defaultValue={'选中文字后使用工具栏设置格式。'}
          autoSize={{ minRows: 4, maxRows: 8 }}
        />
      </div>
      <style>{'\n.demo[data-v-5bb4b474] {\n    display: grid;\n    gap: 12px;\n}\n'}</style>
    </>
  );
}
