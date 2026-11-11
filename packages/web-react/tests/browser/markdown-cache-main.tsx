import { getMarkdownNodeSignature } from '@sdata/web-core/markdown/virtual-state';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { MarkdownRenderMethods } from '../../src/markdown-render/types.js';

import { MarkdownComponentsContext } from '../../src/markdown-render/context.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';

const query = new URLSearchParams(location.search);
const nodes = Array.from({ length: 60 }, (_, index) => ({
  type: 'cache-fixture',
  index,
  raw: `Node ${index}`,
}));
const cache = nodes.map((node, index) => ({
  index,
  height: 140,
  nodeType: node.type,
  signature: query.has('unsigned') ? '' : getMarkdownNodeSignature(node),
}));
const mapping = {
  'cache-fixture': ({ node }: { node: { index: number } }) => (
    <div data-row={node.index} style={{ height: 80 }}>
      Node {node.index}
    </div>
  ),
};
function Fixture() {
  const ref = useRef<MarkdownRenderMethods>(null);
  const [narrow, setNarrow] = useState(false),
    [cacheWidth, setCacheWidth] = useState(query.has('wrong-width') ? 640 : 480);
  const [state, setState] = useState('');
  return (
    <>
      <button onClick={() => setNarrow(!narrow)}>Resize</button>
      <button onClick={() => setCacheWidth(narrow ? 320 : 480)}>Match width</button>
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
        data-testid="viewport"
        style={{ width: narrow ? 320 : 480, height: 1, overflow: 'auto' }}
      >
        <MarkdownComponentsContext value={mapping}>
          <MarkdownRenderer
            ref={ref}
            nodes={nodes}
            final
            fade={false}
            smoothStreaming={false}
            nodeVirtual={false}
            batchRendering={false}
            initialRenderBatchSize={1}
            viewportPriorityOptions={{ rootMargin: '0px' }}
            virtualScroll={{
              enabled: !query.has('disabled'),
              sessionKey: 'cache',
              heightCache: cache,
              heightCacheWidth: cacheWidth,
            }}
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
