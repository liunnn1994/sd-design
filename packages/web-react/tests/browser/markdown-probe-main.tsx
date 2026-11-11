import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { MarkdownRenderProps } from '../../src/markdown-render/types.js';

import { markdownProbeNodes } from '../../../web-core/tests/fixtures/markdown-probe-nodes.js';
import { MarkdownComponentsContext } from '../../src/markdown-render/context.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';
const mapping = { 'probe-fixture': () => <div style={{ height: 80 }}>Measured</div> };
const customMapping = { ...mapping, paragraph: () => <div>Custom paragraph</div> };
const query = new URLSearchParams(location.search);
const nodes = query.has('list-only')
  ? [{ ...markdownProbeNodes[5], ordered: query.has('ordered') }]
  : markdownProbeNodes;
function Fixture() {
  const [width, setWidth] = useState(600),
    [monospace, setSerif] = useState(false),
    [custom, setCustom] = useState(false),
    [enabled, setEnabled] = useState(true);
  return (
    <>
      <button onClick={() => setWidth(width === 600 ? 320 : 600)}>Resize</button>
      <button onClick={() => setWidth(605)}>Resize within bucket</button>
      <button onClick={() => setSerif(!monospace)}>Change font</button>
      <button onClick={() => setCustom(!custom)}>Custom paragraph</button>
      <button onClick={() => setEnabled(!enabled)}>Toggle coordination</button>
      <div
        data-testid="probe-viewport"
        style={{
          width,
          height: 1,
          overflow: 'auto',
          fontFamily: monospace ? 'Courier New' : 'Arial',
        }}
      >
        <MarkdownComponentsContext value={custom ? customMapping : mapping}>
          <MarkdownRenderer
            className="probe-renderer"
            style={{ fontFamily: monospace ? 'Courier New' : 'Arial' }}
            nodes={nodes as MarkdownRenderProps['nodes']}
            final
            fade={false}
            smoothStreaming={false}
            nodeVirtual={false}
            batchRendering={false}
            deferNodesUntilVisible={query.has('list-only') ? false : undefined}
            initialRenderBatchSize={1}
            viewportPriorityOptions={{ rootMargin: '0px' }}
            virtualScroll={{
              enabled,
              sessionKey: 'probe',
              measurementKey: monospace ? 'monospace' : 'arial',
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
