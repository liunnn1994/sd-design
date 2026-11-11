import enUS from '@sdata/web-core/locale/lang/en-us';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
  RichTextEditorRef,
  RichTextEditorValue,
  RichTextEditorPlugin,
  RichTextEditorContentItem,
} from '../../src/rich-text-editor/index.js';

import { ConfigProvider } from '../../src/config-provider/index.js';
import { RichTextEditor } from '../../src/rich-text-editor/index.js';
import '../../styles/rich-text-editor.scss';

const metrics = {
  development: import.meta.env.DEV,
  mounts: 0,
  cleanups: 0,
  updates: 0,
  changes: 0,
  ready: true,
  errors: [] as string[],
};
const plugin: RichTextEditorPlugin = () => {
  metrics.mounts++;
  return () => {
    metrics.cleanups++;
  };
};
const plugins = [plugin];
const nodes: RichTextEditorContentItem[] = [
  'Before ',
  {
    key: 'input',
    name: 'input',
    value: 'Value',
    textValue: 'Input',
    props: { placeholder: 'Node input' },
  },
  ' ',
  { key: 'tag', name: 'tag', textValue: 'Tag', props: { label: 'Closable tag', closable: true } },
  ' ',
  { key: 'custom', name: 'custom', value: 'Custom', textValue: 'Fallback' },
];
function Fixture() {
  const query = new URLSearchParams(location.search);
  const ref = useRef<RichTextEditorRef>(null);
  const saved = useRef<RichTextEditorValue | undefined>(undefined);
  const [value, setValue] = useState<RichTextEditorValue>();
  const [mounted, setMounted] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [readonly, setReadonly] = useState(false);
  Object.assign(window, { readEditor: () => ref.current, richTextMetrics: metrics });
  return (
    <>
      <button onClick={() => setMounted(!mounted)}>Toggle editor</button>
      <button onClick={() => setDisabled(!disabled)}>Toggle disabled</button>
      <button onClick={() => setReadonly(!readonly)}>Toggle readonly</button>
      <button
        onClick={() =>
          ref.current?.setHTML('<h2>Heading</h2><p><strong>Bold</strong> and <em>italic</em></p>')
        }
      >
        Import HTML
      </button>
      <button onClick={() => ref.current?.setMarkdown('## Markdown\n\n**Strong** and `code`')}>
        Import Markdown
      </button>
      <button
        onClick={() => {
          saved.current = ref.current?.getJSON();
        }}
      >
        Save JSON
      </button>
      <button
        onClick={() => {
          if (saved.current)
            if (query.has('controlled')) setValue(structuredClone(saved.current));
            else ref.current?.setJSON(saved.current);
        }}
      >
        Restore JSON
      </button>
      <button onClick={() => ref.current?.setContent(nodes)}>Set nodes</button>
      <button onClick={() => ref.current?.clear()}>Clear</button>
      <button onClick={() => ref.current?.undo()}>Undo</button>
      <button onClick={() => ref.current?.redo()}>Redo</button>
      <button onClick={() => ref.current?.focus(undefined, { selection: 'all' })}>
        Select all
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => ref.current?.formatText('bold')}
      >
        Bold
      </button>
      <ConfigProvider locale={query.has('english') ? enUS : undefined}>
        {mounted && (
          <RichTextEditor
            ref={ref}
            value={query.has('controlled') ? value : undefined}
            defaultValue={query.has('nodes') ? nodes : 'Initial'}
            placeholder="Placeholder"
            plugins={plugins}
            disabled={disabled}
            readonly={readonly}
            autoSize={{ minRows: 2, maxRows: 4 }}
            onValueChange={
              query.has('no-listeners')
                ? undefined
                : (next) => {
                    if (query.has('controlled')) setValue(next);
                  }
            }
            onChange={
              query.has('no-listeners')
                ? undefined
                : () => {
                    metrics.changes++;
                  }
            }
            onUpdate={() => {
              metrics.updates++;
            }}
            onReady={(editor) => {
              metrics.ready &&= ref.current?.editor === editor;
            }}
            onError={(error) => {
              metrics.errors.push(error.message);
            }}
            slots={
              query.has('custom')
                ? {
                    'node-custom': (context) => (
                      <button
                        data-testid="custom-node"
                        disabled={context.disabled || context.readonly}
                        onClick={() => context.update('Updated custom')}
                      >
                        {String(context.node.value)}
                      </button>
                    ),
                  }
                : undefined
            }
          />
        )}
      </ConfigProvider>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
