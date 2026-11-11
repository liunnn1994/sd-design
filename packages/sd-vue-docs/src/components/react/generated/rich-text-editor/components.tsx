/** @jsxImportSource react */
import type { RichTextEditorInstance } from '@sdata/web-react';

import { Button, RichTextEditor, Space } from '@sdata/web-react';
import { type ComponentRef, useRef } from 'react';

export default function Example() {
  const editorRef = useRef<ComponentRef<typeof RichTextEditor> | null>(null);
  const sequence = useRef(0);
  const insertInput = () => {
    editorRef.current?.insertComponent({
      key: `input-${++sequence.current}`,
      name: 'input',
      value: '关键词',
      props: { placeholder: '请输入关键词' },
      textValue: '关键词',
    });
  };
  const insertSelect = () => {
    editorRef.current?.insertComponent({
      key: `select-${++sequence.current}`,
      name: 'select',
      value: 'Vue',
      props: { options: ['Vue', 'React', 'Svelte'] },
      textValue: 'Vue',
    });
  };
  const insertTag = () => {
    editorRef.current?.insertComponent({
      key: `tag-${++sequence.current}`,
      name: 'tag',
      value: '重要',
      props: { label: '重要', color: 'orangered', closable: true },
      textValue: '重要',
    });
  };

  return (
    <>
      <div data-v-5b54465d="" className={'demo'}>
        <Space data-v-5b54465d="" wrap={true}>
          <Button data-v-5b54465d="" onClick={insertInput}>
            {'插入 Input'}
          </Button>
          <Button data-v-5b54465d="" onClick={insertSelect}>
            {'插入 Select'}
          </Button>
          <Button data-v-5b54465d="" onClick={insertTag}>
            {'插入 Tag'}
          </Button>
        </Space>
        <RichTextEditor
          data-v-5b54465d=""
          ref={editorRef}
          defaultValue={'这段内容中可以插入组件库控件：'}
          autoSize={{ minRows: 4, maxRows: 8 }}
        />
      </div>
      <style>{'\n.demo[data-v-5b54465d] {\n    display: grid;\n    gap: 12px;\n}\n'}</style>
    </>
  );
}
