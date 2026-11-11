import {
  getMarkdownContentHash,
  getMarkdownNodeSignature,
} from '@sdata/web-core/markdown/virtual-state';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
  MarkdownRenderMethods,
  MarkstreamVirtualState,
} from '../../src/markdown-render/types.js';

import { MarkdownComponentsContext } from '../../src/markdown-render/context.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';
const nodes = Array.from({ length: 60 }, (_, index) => ({
  type: 'restore-fixture',
  index,
  raw: `Node ${index}`,
}));
const empty: typeof nodes = [];
const cache = nodes.map((node, index) => ({
  index,
  height: 140,
  nodeType: node.type,
  signature: getMarkdownNodeSignature(node),
}));
const mapping = {
  'restore-fixture': ({ node }: { node: { index: number } }) => (
    <div data-row={node.index} style={{ height: 80 }}>
      Node {node.index}
    </div>
  ),
};
function Fixture() {
  const query = new URLSearchParams(location.search);
  const ref = useRef<MarkdownRenderMethods>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [populated, setPopulated] = useState(!query.has('empty')),
    [expanded, setExpanded] = useState(false);
  const [session, setSession] = useState('restore'),
    [state, setState] = useState('');
  function restore() {
    const current = ref.current!.captureVirtualState({ includeEmptyState: true })!;
    const saved: MarkstreamVirtualState = {
      ...current,
      sessionKey: 'restore',
      width: 480,
      metrics: { ...current.metrics, width: 480 },
      contentHash: getMarkdownContentHash(nodes),
      heightCache: cache,
      anchorCaptured: true,
      anchor: { type: 'bottom', distanceFromBottomPx: 0 },
    };
    ref.current!.restoreVirtualState(saved, { restoreAnchor: !query.has('no-anchor') });
  }
  return (
    <>
      <button onClick={restore}>Restore</button>
      <button onClick={() => setPopulated(true)}>Populate</button>
      <button onClick={() => setExpanded(true)}>Expand</button>
      <button onClick={() => setSession('foreign')}>Change session</button>
      <button
        onClick={async () => {
          await ref.current!.forceMeasure();
          setState(JSON.stringify(ref.current!.captureVirtualState({ includeEmptyState: true })));
        }}
      >
        Read
      </button>
      <output>{state}</output>
      <div
        ref={frame}
        data-testid="viewport"
        style={{ width: expanded ? 480 : 0, height: 120, overflow: 'auto' }}
      >
        <MarkdownComponentsContext value={mapping}>
          <MarkdownRenderer
            ref={ref}
            nodes={populated ? nodes : empty}
            final
            fade={false}
            smoothStreaming={false}
            nodeVirtual={false}
            batchRendering={false}
            initialRenderBatchSize={1}
            viewportPriorityOptions={{ rootMargin: '0px' }}
            virtualScroll={{ enabled: true, sessionKey: session, scrollRoot: () => frame.current }}
          />
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
