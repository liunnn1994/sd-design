import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { MarkdownRenderProps } from '../../src/markdown-render/types.js';

import { MarkdownComponentsContext } from '../../src/markdown-render/context.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';

function Nested() {
  return (
    <MarkdownRenderer
      content="Nested text"
      typewriter="precise"
      smoothStreaming={false}
      fade={false}
    />
  );
}
const mapping = { fixture_cursor: Nested };
const smoothOptions = {
  minCharsPerSecond: 60,
  maxCharsPerSecond: 60,
  startDelayMs: 0,
  maxCharsPerCommit: 4,
};
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [mode, setMode] = useState<MarkdownRenderProps['typewriter']>(
    query.get('mode') === 'simple' ? 'simple' : query.get('mode') === 'boolean' ? true : 'precise',
  );
  const [content, setContent] = useState(
    'A **bold** opening followed by enough ordinary text to wrap across multiple lines. 最后的文字 tail',
  );
  const [final, setFinal] = useState(false);
  const [supplied, setSupplied] = useState(query.has('nodes'));
  const [mounted, setMounted] = useState(true);
  const [narrow, setNarrow] = useState(false);
  const nodes = useMemo(
    () => [
      {
        type: 'paragraph',
        raw: '',
        children: [{ type: 'text', content: 'Supplied text', raw: '' }],
      },
    ],
    [],
  );
  if (query.has('owners'))
    return (
      <>
        <MarkdownComponentsContext value={mapping}>
          <MarkdownRenderer
            data-testid="owner-parent"
            nodes={[{ type: 'fixture_cursor', raw: '' }]}
            typewriter={false}
          />
        </MarkdownComponentsContext>
        <MarkdownRenderer
          data-testid="independent"
          content="Independent text"
          typewriter="precise"
          smoothStreaming={false}
          fade={false}
        />
      </>
    );
  return (
    <>
      <button onClick={() => setContent((value) => value + ' continued')}>Append</button>
      <button onClick={() => setContent((value) => value + '\n\n```txt\nHeavy code\n```')}>
        Code tail
      </button>
      <button onClick={() => setContent((value) => value + '\n\nAfter code')}>
        Paragraph tail
      </button>
      <button
        onClick={() =>
          setContent(
            (value) =>
              value + Array.from({ length: 30 }, (_, index) => `\n\nLine ${index}`).join(''),
          )
        }
      >
        Many lines
      </button>
      <button onClick={() => setFinal(true)}>Finish</button>
      <button
        onClick={() => {
          setFinal(false);
          setContent((value) => value + ' resumed');
        }}
      >
        Resume
      </button>
      <button onClick={() => setMode('simple')}>Simple</button>
      <button onClick={() => setMode('precise')}>Precise</button>
      <button onClick={() => setMode(false)}>Off</button>
      <button onClick={() => setSupplied(!supplied)}>Toggle nodes</button>
      <button onClick={() => setMounted(!mounted)}>Toggle renderer</button>
      <button onClick={() => setNarrow(!narrow)}>Narrow</button>
      <section data-testid="cursor-host">
        {mounted && (
          <MarkdownRenderer
            content={content}
            nodes={supplied ? nodes : undefined}
            final={final}
            typewriter={mode}
            smoothStreaming={query.has('smooth')}
            smoothStreamingOptions={smoothOptions}
            fade={false}
            renderAsFragment={query.has('fragment')}
            batchRendering={false}
            deferNodesUntilVisible={false}
            nodeVirtual={false}
            style={{
              width: narrow ? 150 : 280,
              padding: 10,
              border: '1px solid black',
              ...(query.has('scroll') ? { height: 100, overflow: 'auto' } : {}),
            }}
          />
        )}
      </section>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
