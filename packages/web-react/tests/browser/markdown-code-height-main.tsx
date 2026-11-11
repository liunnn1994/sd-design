import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  markdownCodeHeightNodes,
  markdownCodeHeightScenarios,
} from '../../../web-core/tests/fixtures/markdown-code-height-nodes.js';
import { MarkdownComponentsContext } from '../../src/markdown-render/context.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';

const mapping = { 'fixture-height': () => <div style={{ height: 80 }}>Measured</div> };
const custom = { ...mapping, code_block: () => <div>Custom code</div> };
const initial =
  markdownCodeHeightScenarios.find((scenario) => location.search.includes(scenario.name)) ??
  markdownCodeHeightScenarios[0];
function Fixture() {
  const [narrow, setNarrow] = useState(false),
    [customCode, setCustomCode] = useState(false),
    [configured, setConfigured] = useState(false);
  const scenario = configured ? markdownCodeHeightScenarios[4] : initial;
  return (
    <>
      <button onClick={() => setNarrow(!narrow)}>Resize</button>
      <button onClick={() => setCustomCode(!customCode)}>Custom code</button>
      <button onClick={() => setConfigured(!configured)}>Change options</button>
      <div style={{ width: narrow ? 320 : 600, height: 1, overflow: 'auto' }}>
        <MarkdownComponentsContext value={customCode ? custom : mapping}>
          <MarkdownRenderer
            nodes={markdownCodeHeightNodes}
            final
            fade={false}
            smoothStreaming={false}
            renderCodeBlocksAsPre={scenario.pre}
            codeBlockOptions={scenario.options}
            codeBlockProps={scenario.props}
            nodeVirtual={false}
            batchRendering={false}
            initialRenderBatchSize={1}
            viewportPriorityOptions={{ rootMargin: '0px' }}
            virtualScroll={{ enabled: true, sessionKey: 'code-height' }}
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
