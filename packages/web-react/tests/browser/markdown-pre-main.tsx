import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  markdownPreNode,
  markdownPreScenarios,
} from '../../../web-core/tests/fixtures/markdown-pre-node.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';
const query = new URLSearchParams(location.search);
const initial =
  markdownPreScenarios.find((value) => query.has(value.name)) ?? markdownPreScenarios[0];
function Fixture() {
  const [loading, setLoading] = useState(false),
    [changed, setChanged] = useState(false),
    [events, setEvents] = useState<string[]>([]),
    [written, setWritten] = useState<string[]>([]);
  const pending = useRef<{ resolve(): void; reject(error: Error): void } | undefined>(undefined);
  const scenario = changed ? markdownPreScenarios[1] : initial;
  const language = query.get('language') ?? markdownPreNode.language;
  const node = {
    ...markdownPreNode,
    language,
    loading,
    raw: query.has('plain-title') ? '```typescript\ncode\n```' : markdownPreNode.raw,
  };
  return (
    <>
      <button onClick={() => setLoading(!loading)}>Toggle loading</button>
      <button onClick={() => setChanged(!changed)}>Change options</button>
      <button onClick={() => pending.current?.resolve()}>Resolve copy</button>
      <button onClick={() => pending.current?.reject(new Error('Fixture rejected'))}>
        Reject copy
      </button>
      <output data-testid="pre-events">{events.join('|')}</output>
      <output data-testid="pre-written">{JSON.stringify(written)}</output>
      <div style={{ width: 600 }}>
        <MarkdownRenderer
          nodes={[node]}
          final={!loading}
          fade={false}
          smoothStreaming={false}
          batchRendering={false}
          deferNodesUntilVisible={false}
          nodeVirtual={false}
          renderCodeBlocksAsPre
          codeBlockOptions={scenario.options}
          codeBlockProps={{
            ...scenario.props,
            showTooltips: !query.has('no-tooltip'),
            showCopyButton: !query.has('no-copy'),
            clipboardWriter: (text) => {
              setWritten((old) => [...old, text]);
              return new Promise<void>((resolve, reject) => {
                pending.current = { resolve, reject };
              });
            },
          }}
          isDark={scenario.dark}
          onCopyCode={() => setEvents((old) => [...old, 'copy-code'])}
          onCopy={() => setEvents((old) => [...old, 'copy'])}
          onClick={() => setEvents((old) => [...old, 'click'])}
        />
      </div>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
