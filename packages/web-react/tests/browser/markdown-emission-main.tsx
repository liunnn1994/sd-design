import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
  MarkdownRenderMethods,
  MarkstreamVirtualMetrics,
} from '../../src/markdown-render/types.js';

import { MarkdownComponentsContext } from '../../src/markdown-render/context.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';
const nodes = Array.from({ length: 10 }, (_, index) => ({
  type: 'emission-fixture',
  raw: String(index),
}));
const mapping = { 'emission-fixture': () => <div style={{ height: 40 }}>Node</div> };
function Fixture() {
  const ref = useRef<MarkdownRenderMethods>(null),
    events = useRef<MarkstreamVirtualMetrics[]>([]),
    failUnmount = useRef(false);
  const [narrow, setNarrow] = useState(false),
    [mounted, setMounted] = useState(true),
    [thread, setThread] = useState('one');
  Object.assign(window, { markdownEmissions: events.current });
  return (
    <>
      <button onClick={() => setNarrow(!narrow)}>Resize</button>
      <button onClick={() => setThread('two')}>Change thread</button>
      <button
        onClick={() => {
          failUnmount.current = new URLSearchParams(location.search).has('throw-unmount');
          setMounted(!mounted);
        }}
      >
        Toggle renderer
      </button>
      <button
        onClick={() => {
          events.current.length = 0;
        }}
      >
        Reset events
      </button>
      <button
        onClick={() => {
          void ref.current!.forceMeasure();
        }}
      >
        Force measure
      </button>
      <div style={{ width: narrow ? 320 : 480 }}>
        <MarkdownComponentsContext value={mapping}>
          {mounted && (
            <MarkdownRenderer
              ref={ref}
              nodes={nodes}
              final={false}
              fade={false}
              smoothStreaming={false}
              nodeVirtual={false}
              batchRendering={false}
              deferNodesUntilVisible={false}
              virtualScroll={{
                enabled: true,
                sessionKey: 'emissions',
                threadKey: thread,
                emitIntervalMs: 800,
                settleMode: 'manual',
              }}
              onHeightChange={(event) => {
                events.current.push(event);
                if (failUnmount.current) throw new Error('Unmount callback failure');
              }}
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
