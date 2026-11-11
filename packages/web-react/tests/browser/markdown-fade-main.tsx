import { StrictMode, useMemo, useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';

import { MarkdownComponentsContext } from '../../src/markdown-render/context.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';

const Initial = () => <div data-widget="initial">Initial widget</div>;
const Replacement = () => <section data-widget="replacement">Replacement widget</section>;
const style = { '--fade-duration': '1s', '--stream-update-fade-duration': '1s' } as CSSProperties;
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [content, setContent] = useState(query.has('code') ? '```txt\nCode\n```' : 'First');
  const [final, setFinal] = useState(query.has('final'));
  const [fade, setFade] = useState(!query.has('disabled'));
  const [mounted, setMounted] = useState(true);
  const [alternate, setAlternate] = useState(false);
  const mapping = useMemo(
    () => ({ fixture_enter: alternate ? Replacement : Initial }),
    [alternate],
  );
  const nodes = useMemo(() => [{ type: 'fixture_enter', raw: '' }], []);
  return (
    <>
      <button onClick={() => setContent((value) => value + ' delta')}>Append text</button>
      <button onClick={() => setContent((value) => value + '\n\nSecond block')}>
        Append block
      </button>
      <button onClick={() => setContent('Replacement')}>Replace text</button>
      <button onClick={() => setFinal(true)}>Finish</button>
      <button onClick={() => setFade(!fade)}>Toggle fade</button>
      <button onClick={() => setMounted(!mounted)}>Toggle renderer</button>
      <button onClick={() => setAlternate(!alternate)}>Replace component</button>
      <section data-testid="fade-host">
        <MarkdownComponentsContext value={mapping}>
          {mounted && (
            <MarkdownRenderer
              content={content}
              nodes={query.has('custom') ? nodes : undefined}
              final={final}
              fade={fade}
              smoothStreaming={false}
              renderAsFragment={query.has('fragment')}
              batchRendering={false}
              deferNodesUntilVisible={false}
              nodeVirtual={false}
              renderCodeBlocksAsPre
              style={query.has('defaults') ? undefined : style}
            />
          )}
        </MarkdownComponentsContext>
      </section>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
