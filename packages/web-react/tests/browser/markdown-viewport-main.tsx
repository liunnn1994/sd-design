import { StrictMode, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { MarkdownRenderMethods } from '../../src/markdown-render/types.js';

import { MarkdownComponentsContext } from '../../src/markdown-render/context.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';

const mapping = {
  fixture: ({ node }: { node: { index: number } }) => (
    <div data-row={node.index} style={{ height: 80 }}>
      Node {node.index}
    </div>
  ),
};
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [mounted, setMounted] = useState(true);
  const [session, setSession] = useState('one');
  const [thread, setThread] = useState('thread-one');
  const [disabled, setDisabled] = useState(false);
  const [count, setCount] = useState(query.has('large') ? 901 : 60);
  const [alternateBatch, setAlternateBatch] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [observedWidth, setObservedWidth] = useState(0);
  const [metrics, setMetrics] = useState('');
  const renderer = useRef<MarkdownRenderMethods>(null);
  const nodes = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        type: 'fixture',
        index,
        raw: String(index),
      })),
    [count],
  );
  return (
    <>
      <button onClick={() => setMounted(!mounted)}>Toggle renderer</button>
      <button onClick={() => setSession(session === 'one' ? 'two' : 'one')}>Change session</button>
      <button onClick={() => setThread(thread === 'thread-one' ? 'thread-two' : 'thread-one')}>
        Change thread
      </button>
      <button onClick={() => setDisabled(!disabled)}>Toggle deferral</button>
      <button onClick={() => setCount((value) => value + 10)}>Append nodes</button>
      <button onClick={() => setAlternateBatch(!alternateBatch)}>Change batch config</button>
      <button onClick={() => setNarrow(!narrow)}>Resize viewport</button>
      <button
        onClick={async () => {
          setMetrics('');
          await renderer.current!.forceMeasure();
          setMetrics(JSON.stringify(renderer.current!.getVirtualMetrics()));
        }}
      >
        Measure
      </button>
      <button
        onClick={async () => {
          setMetrics('');
          await renderer.current!.settle({ flushPendingTimers: true });
          setMetrics(JSON.stringify(renderer.current!.getVirtualMetrics()));
        }}
      >
        Settle
      </button>
      <output>{metrics}</output>
      <span data-testid="observed-width">{observedWidth}</span>
      <div
        data-testid="viewport"
        style={{ width: narrow ? 240 : 480, height: 120, overflowY: 'auto' }}
      >
        <MarkdownComponentsContext value={mapping}>
          {mounted && (
            <MarkdownRenderer
              ref={renderer}
              nodes={nodes}
              final={!query.has('batch')}
              nodeVirtual={false}
              maxLiveNodes={query.has('batch') ? 0 : 220}
              smoothStreaming={false}
              batchRendering={query.has('batch')}
              initialRenderBatchSize={alternateBatch ? 2 : 1}
              renderBatchSize={alternateBatch ? 5 : 10}
              renderBatchDelay={query.has('fast') ? 20 : 500}
              deferNodesUntilVisible={!disabled && !query.has('disabled')}
              viewportPriority={!query.has('no-priority')}
              viewportPriorityOptions={{
                rootMargin: query.has('invalid-margin') ? 'invalid' : '0px',
                maxTargets: query.has('cap') ? 2 : 640,
              }}
              renderAsFragment={query.has('fragment')}
              virtualScroll={{
                enabled: true,
                sessionKey: session,
                threadKey: query.has('batch') ? thread : undefined,
              }}
              onHeightChange={(value) => setObservedWidth(value.width)}
            />
          )}
        </MarkdownComponentsContext>
      </div>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
