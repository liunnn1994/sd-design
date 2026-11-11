import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';

const contents = {
  heading: '## [Link](#target)',
  paragraph: '[Link](#target)',
  blockquote: '> [Link](#target)',
  admonition: ':::warning Notice\n[Link](#target)\n:::',
  html: '<div><a href="#target">Link</a></div>',
};
function Fixture() {
  const query = new URLSearchParams(location.search);
  const kind = query.get('kind') ?? 'paragraph';
  const [fragment, setFragment] = useState(query.has('fragment'));
  const [mounted, setMounted] = useState(true);
  const [version, setVersion] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const record = (name: string, event: MouseEvent, id?: string) => {
    if (query.has('prevent')) event.preventDefault();
    const contains =
      event.currentTarget instanceof Element && event.currentTarget.contains(event.target as Node);
    setEvents((old) => [
      ...old,
      `${name}:${version}:${event instanceof MouseEvent}:${contains}:${id ?? '-'}`,
    ]);
  };
  const nodes =
    kind === 'custom'
      ? [{ type: 'x-control', tag: 'x-control', raw: '', content: 'Custom' }]
      : kind === 'image'
        ? [
            {
              type: 'image',
              src: '/markdown-event-image.svg',
              alt: 'Picture',
              title: null,
              raw: '',
            },
          ]
        : kind === 'large'
          ? Array.from({ length: 60 }, (_, index) => ({
              type: 'heading',
              level: 2,
              children: [{ type: 'text', content: `Heading ${index}`, raw: '' }],
              raw: '',
            }))
          : undefined;
  return (
    <>
      <button onClick={() => setEvents([])}>Clear</button>
      <button onClick={() => setVersion((value) => value + 1)}>Update</button>
      <button onClick={() => setFragment(!fragment)}>Toggle fragment</button>
      <button onClick={() => setMounted(!mounted)}>Toggle renderer</button>
      <output data-testid="mouse-events">{events.join('|')}</output>
      <section data-testid="event-host">
        <button data-testid="outside">Outside renderer</button>
        {mounted && (
          <MarkdownRenderer
            content={contents[kind as keyof typeof contents]}
            nodes={nodes}
            final
            renderAsFragment={fragment}
            batchRendering={kind === 'large'}
            initialRenderBatchSize={1}
            renderBatchSize={1}
            renderBatchDelay={10000}
            nodeVirtual={kind === 'large' && !query.has('nonvirtual')}
            maxLiveNodes={query.has('nonvirtual') ? 0 : 2}
            liveNodeBuffer={0}
            showTooltips={false}
            id="markdown-host"
            title={`Title ${version}`}
            aria-label="Markdown content"
            data-owner={`owner-${version}`}
            tabIndex={0}
            style={{ padding: 10 }}
            streamingComponents={{
              'x-control': () => (
                <button
                  data-testid="custom-node"
                  onClickCapture={(event) => {
                    if (query.has('capture')) event.stopPropagation();
                  }}
                >
                  Custom
                </button>
              ),
            }}
            onKeyDown={(event) => setEvents((old) => [...old, `key:${event.key}`])}
            onClick={(event, id) => record('click', event, id)}
            onMouseOver={(event) => record('over', event)}
            onMouseOut={(event) => record('out', event)}
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
