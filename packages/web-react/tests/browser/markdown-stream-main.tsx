import { StrictMode, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
  MarkdownRenderMethods,
  MarkdownRenderProps,
} from '../../src/markdown-render/types.js';

import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';

const initial = 'An ordinary paragraph '.repeat(5);
const parsedSources: string[] = [];
Object.assign(window, { markdownParsedSources: parsedSources });
const customize: NonNullable<MarkdownRenderProps['customMarkdownIt']> = (engine) => {
  const parse = engine.parse.bind(engine);
  engine.parse = (...args) => {
    parsedSources.push(args[0]);
    return parse(...args);
  };
  return engine;
};
const smoothOptions = {
  minCharsPerSecond: 1e9,
  maxCharsPerSecond: 1e9,
  startDelayMs: 0,
  targetLatencyMs: 1,
  maxCharsPerCommit: 10000,
  flushOnFinish: true,
};
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [content, setContent] = useState(initial);
  const [final, setFinal] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [strict, setStrict] = useState(false);
  const renderer = useRef<MarkdownRenderMethods>(null);
  const options = useMemo(() => ({ requireClosingStrong: strict }), [strict]);
  return (
    <>
      <button onClick={() => setContent((value) => value + ' alpha')}>Append</button>
      <button onClick={() => setContent((value) => value + '\n\n## Boundary')}>Heading</button>
      <button
        onClick={() => setContent((value) => value + '\n\n| A | B |\n| --- | --- |\n| C | D |')}
      >
        Table
      </button>
      <button onClick={() => setFinal(true)}>Finish</button>
      <button onClick={() => setContent('Replacement')}>Replace</button>
      <button onClick={() => setStrict(!strict)}>Change parser options</button>
      <button onClick={() => setMounted(!mounted)}>Toggle renderer</button>
      <button
        onClick={() =>
          void renderer.current!.settle({ frames: 1, timeoutMs: 50, flushPendingTimers: true })
        }
      >
        Flush pending
      </button>
      <output data-testid="source">{content}</output>
      {mounted && (
        <MarkdownRenderer
          ref={renderer}
          content={content}
          final={final}
          customMarkdownIt={customize}
          parseOptions={options}
          smoothStreaming={!query.has('sync')}
          smoothStreamingOptions={smoothOptions}
          parseCoalesceMs={query.has('timer') ? 300 : query.has('zero') ? 0 : 10000}
          batchRendering={false}
          deferNodesUntilVisible={false}
        />
      )}
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
