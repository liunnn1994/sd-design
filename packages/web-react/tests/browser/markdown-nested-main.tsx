import { StrictMode, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { MarkdownRenderMethods } from '../../src/markdown-render/types.js';

import { MarkdownComponentsContext } from '../../src/markdown-render/context.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';

function NestedImage({ indexKey }: { indexKey?: string | number }) {
  const query = new URLSearchParams(location.search);
  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes] = useState(() => [
    {
      type: 'image',
      src: `/nested-markdown-image.svg?case=${crypto.randomUUID()}`,
      alt: 'Nested image',
      title: null,
      raw: '',
    },
  ]);
  return (
    <div style={{ minHeight: 100 }}>
      <button onClick={() => setMounted(!mounted)}>Toggle child</button>
      <button onClick={() => setNodes((value) => value.map((node) => ({ ...node })))}>
        Clone image AST
      </button>
      {mounted && (
        <MarkdownRenderer
          nodes={nodes}
          final
          indexKey={`${indexKey}-inner`}
          renderAsFragment={query.has('fragment')}
          batchRendering={false}
          deferNodesUntilVisible={false}
          virtualScroll={{ enabled: true, sessionKey: 'child' }}
        />
      )}
    </div>
  );
}
const mapping = { fixture_nested: NestedImage };
function Fixture() {
  const query = new URLSearchParams(location.search);
  const renderer = useRef<MarkdownRenderMethods>(null);
  const [metrics, setMetrics] = useState('');
  const nodes = useMemo(() => [{ type: 'fixture_nested', raw: '' }], []);
  return (
    <>
      <button
        onClick={async () => {
          setMetrics('');
          const result = await renderer.current!.settle({ frames: 2, timeoutMs: 80 });
          setMetrics(JSON.stringify(result));
        }}
      >
        Settle parent
      </button>
      <output>{metrics}</output>
      <MarkdownComponentsContext value={mapping}>
        <MarkdownRenderer
          ref={renderer}
          nodes={query.has('minimal') ? undefined : nodes}
          content={query.has('minimal') ? '## Minimal' : undefined}
          final
          indexKey="outer"
          domMode={query.has('minimal') ? 'minimal' : 'full'}
          mode="minimal"
          fade={false}
          nodeVirtual={false}
          maxLiveNodes={0}
          viewportPriority={false}
          batchRendering={false}
          deferNodesUntilVisible={false}
          virtualScroll={query.has('minimal') ? undefined : { enabled: true, sessionKey: 'parent' }}
        />
      </MarkdownComponentsContext>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
