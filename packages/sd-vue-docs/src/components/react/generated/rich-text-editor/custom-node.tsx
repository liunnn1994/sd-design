/** @jsxImportSource react */
import type { RichTextEditorInstance } from '@sdata/web-react';

import { Button, RichTextEditor, Tag } from '@sdata/web-react';
import { type ComponentRef, useRef } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const editorRef = useRef<ComponentRef<typeof RichTextEditor> | null>(null);
  const sequence = useRef(0);
  const insertMention = () => {
    editorRef.current?.insertComponent({
      key: `mention-${++sequence.current}`,
      name: 'mention',
      value: '张三',
      textValue: '@张三',
    });
  };

  return (
    <>
      <div data-v-f483c867="" className={'demo'}>
        <Button data-v-f483c867="" onClick={insertMention}>
          {'插入自定义 Mention 节点'}
        </Button>
        <RichTextEditor
          data-v-f483c867=""
          ref={editorRef}
          defaultValue={'参与人：'}
          slots={{
            'node-mention': ({ node, update, remove }) => (
              <>
                <Tag data-v-f483c867="" color={'arcoblue'} closable={true} onClose={remove}>
                  <span
                    data-v-f483c867=""
                    onClick={() => {
                      update(node.value === '张三' ? '李四' : '张三');
                    }}
                  >
                    {' @'}
                    {formatValue(node.value)}
                  </span>
                </Tag>
              </>
            ),
          }}
        />
      </div>
      <style>{'\n.demo[data-v-f483c867] {\n    display: grid;\n    gap: 12px;\n}\n'}</style>
    </>
  );
}
