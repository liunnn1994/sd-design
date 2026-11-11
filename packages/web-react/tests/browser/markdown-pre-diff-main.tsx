import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  getMarkdownDiffNode,
  markdownDiffScenarios,
} from '../../../web-core/tests/fixtures/markdown-pre-diff.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';
const query = new URLSearchParams(location.search);
const initialCase = query.get('case') as
  | 'source'
  | 'patch'
  | 'blank'
  | 'loading'
  | 'numbered'
  | null;
const scenario = (query.get('scenario') ?? 'split') as keyof typeof markdownDiffScenarios;
function Fixture() {
  const [narrow, setNarrow] = useState(false),
    [expanded, setExpanded] = useState(false),
    [changed, setChanged] = useState(false),
    [caseName, setCaseName] = useState(initialCase ?? 'source'),
    [visible, setVisible] = useState(true);
  const settings = markdownDiffScenarios[scenario];
  const standalone = initialCase && ['patch', 'blank', 'loading'].includes(initialCase);
  return (
    <>
      <button onClick={() => setNarrow(!narrow)}>Resize</button>
      <button onClick={() => setExpanded(!expanded)}>Expand</button>
      <button onClick={() => setChanged(!changed)}>Change</button>
      <button onClick={() => setCaseName(caseName === 'source' ? 'numbered' : 'blank')}>
        Number width
      </button>
      <button onClick={() => setVisible(!visible)}>Unmount</button>
      <div style={{ width: narrow ? 320 : 600 }}>
        {visible && (
          <MarkdownRenderer
            nodes={[getMarkdownDiffNode(caseName)]}
            final={caseName !== 'loading'}
            fade={false}
            smoothStreaming={false}
            batchRendering={false}
            deferNodesUntilVisible={false}
            nodeVirtual={false}
            renderCodeBlocksAsPre
            isDark={scenario === 'dark'}
            codeBlockOptions={{
              fontFamily: 'Courier New',
              fontSize: changed ? 16 : 14,
              lineHeight: changed ? 26 : 22,
              ...(standalone ? { diffStyle: 'unified' } : settings.options),
            }}
            codeBlockProps={
              standalone
                ? { diffHideUnchangedRegions: true }
                : { ...settings.props, ...(expanded ? { diffHideUnchangedRegions: false } : {}) }
            }
          />
        )}
      </div>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
