import { StrictMode, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
  MarkdownRenderMethods,
  MarkstreamVirtualState,
} from '../../src/markdown-render/types.js';

import { MarkdownComponentsContext } from '../../src/markdown-render/context.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';

function FixtureRow({ node }: { node: { index: number; height: number } }) {
  return (
    <div
      data-row={node.index}
      style={{ height: node.height, background: node.index % 2 ? '#eee' : '#fff' }}
    >
      Node {node.index}
    </div>
  );
}
const mapping = { fixture: FixtureRow };
function Fixture() {
  const query = new URLSearchParams(location.search);
  const frame = useRef<HTMLDivElement>(null);
  const unresolvedFrame = useRef<HTMLElement | undefined>(undefined);
  const renderer = useRef<MarkdownRenderMethods>(null);
  const saved = useRef<MarkstreamVirtualState | null>(null);
  const [output, setOutput] = useState('');
  const heightReason = useRef('');
  const [eventReasons, setEventReasons] = useState({ height: '', state: '' });
  const [changed, setChanged] = useState(false);
  const [session, setSession] = useState('one');
  const [image, setImage] = useState(false);
  const [mounted, setMounted] = useState(true);
  const finals = useRef(0);
  const settles = useRef(0);
  const count = query.has('virtual') ? 200 : 80;
  const nodes = useMemo(
    () => [
      ...Array.from({ length: count }, (_, index) => ({
        type: 'fixture',
        index,
        height: changed && index === 1 ? 96 : 24 + (index % 3) * 8,
        raw: String(index),
      })),
      ...(image
        ? [
            {
              type: 'image',
              src: '/markdown-root-image.svg',
              alt: 'Async image',
              title: null,
              raw: '![](image)',
            },
          ]
        : []),
    ],
    [count, changed, image],
  );
  const read = () =>
    setOutput(
      JSON.stringify({
        ...renderer.current!.getVirtualMetrics(),
        finals: finals.current,
        settles: settles.current,
      }),
    );
  return (
    <>
      <button
        onClick={async () => {
          setOutput('');
          await renderer.current!.settle({ frames: 2, timeoutMs: 1000, flushPendingTimers: true });
          read();
        }}
      >
        Settle
      </button>
      <button
        onClick={async () => {
          setOutput('');
          await renderer.current!.settle({ frames: 2, timeoutMs: 80 });
          read();
        }}
      >
        Settle early
      </button>
      <button
        onClick={async () => {
          setOutput('');
          const result = await renderer.current!.forceMeasure('manual');
          setOutput(
            JSON.stringify({ ...result, finals: finals.current, settles: settles.current }),
          );
        }}
      >
        Measure
      </button>
      <button onClick={read}>Read</button>
      <button onClick={() => renderer.current!.scrollToNode(count / 2, 'start')}>
        Scroll middle
      </button>
      <button onClick={() => renderer.current!.scrollToNode(0, 'start')}>Top</button>
      <button
        onClick={() => {
          saved.current = renderer.current!.captureVirtualState({ includeEmptyState: true });
          setOutput(JSON.stringify(saved.current));
        }}
      >
        Capture
      </button>
      <button
        onClick={() =>
          renderer.current!.restoreVirtualState(saved.current!, {
            restoreAnchor: true,
            restoreToken: `${session}-anchor`,
          })
        }
      >
        Restore anchor
      </button>
      <button onClick={() => renderer.current!.restoreVirtualState(saved.current!)}>
        Restore cache
      </button>
      <button onClick={() => setChanged(!changed)}>Change row</button>
      <button onClick={() => setSession(session === 'one' ? 'two' : 'one')}>Change session</button>
      <button onClick={() => setImage(!image)}>Add image</button>
      <button onClick={() => setMounted(!mounted)}>Toggle renderer</button>
      <output data-testid="root-metrics">{output}</output>
      <output data-testid="event-reasons">{JSON.stringify(eventReasons)}</output>
      <div
        data-testid="scroll-frame"
        ref={frame}
        style={{
          height: 160,
          width: 600,
          overflowY: 'auto',
          position: 'relative',
          ...(query.has('reverse') ? { display: 'flex', flexDirection: 'column-reverse' } : {}),
        }}
      >
        <MarkdownComponentsContext value={mapping}>
          {mounted && (
            <MarkdownRenderer
              style={{ flexShrink: 0 }}
              ref={renderer}
              nodes={query.has('content') ? undefined : nodes}
              content={
                query.has('content')
                  ? '## Heading\n\nA **bold** [link](#heading) and `code`.\n\n- [x] Done\n- [ ] Pending\n\n> Quote'
                  : undefined
              }
              final
              batchRendering={false}
              deferNodesUntilVisible={false}
              nodeVirtual={query.has('virtual')}
              maxLiveNodes={8}
              liveNodeBuffer={2}
              virtualScroll={{
                enabled: true,
                sessionKey: session,
                measurementKey: 'fixture',
                scrollRoot: query.has('empty-ref')
                  ? unresolvedFrame
                  : query.has('empty-resolver')
                    ? () => unresolvedFrame
                    : frame,
                settleMode: query.has('manual') ? 'manual' : 'auto',
              }}
              onRenderFinal={() => {
                finals.current++;
              }}
              onHeightChange={(metrics) => {
                heightReason.current = metrics.reason;
              }}
              onVirtualStateChange={(state) =>
                setEventReasons({ height: heightReason.current, state: state.metrics.reason })
              }
              onRenderSettled={() => {
                settles.current++;
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
