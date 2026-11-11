import { RichTextEditor, type RichTextEditorRef, type RichTextEditorProps } from '@sdata/web-react';
import { useRef } from 'react';
export type {
  SerializedInlineComponentNode,
  RichTextEditorBuiltInNodeData,
  RichTextEditorSlots,
} from '@sdata/web-react';

export function RichTextEditorTypeConsumer() {
  const editor = useRef<RichTextEditorRef>(null);
  const props: RichTextEditorProps = {
    defaultValue: ['Text', { key: 'input', name: 'input', value: 'Value' }],
    slots: {
      'node-user': (context) => {
        context.update('Updated');
        // @ts-expect-error Node snapshots cannot be changed directly.
        context.node.value = 'Changed';
        return context.node.textValue;
      },
    },
  };
  // @ts-expect-error Controlled state must be serialized JSON, not plain text.
  const invalid: RichTextEditorProps = { value: 'Text' };
  void invalid;
  return <RichTextEditor {...props} ref={editor} onReady={() => editor.current?.getJSON()} />;
}
