import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { markdownHeightNodes } from '../../../web-core/tests/fixtures/markdown-height-nodes.js';
import { MarkdownComponentsContext } from '../../src/markdown-render/context.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';

const mapping = { 'fixture-height': () => <div style={{ height: 40 }}>Measured</div> };
function Fixture() {
  const [narrow, setNarrow] = useState(false);
  return (
    <>
      <button onClick={() => setNarrow(!narrow)}>Resize</button>
      <div style={{ width: narrow ? 320 : 600, height: 1, overflow: 'auto' }}>
        <MarkdownComponentsContext value={mapping}>
          <MarkdownRenderer
            nodes={markdownHeightNodes}
            final
            fade={false}
            smoothStreaming={false}
            nodeVirtual={false}
            batchRendering={false}
            initialRenderBatchSize={1}
            viewportPriorityOptions={{ rootMargin: '0px' }}
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
