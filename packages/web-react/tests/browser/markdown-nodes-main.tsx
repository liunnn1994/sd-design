import { type RenderContext } from 'markstream-react';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { MarkdownAdmonitionNode } from '../../src/markdown-render/nodes/admonition.js';
import { MarkdownCheckboxNode } from '../../src/markdown-render/nodes/checkbox.js';
import { MarkdownContainerNode } from '../../src/markdown-render/nodes/container.js';
import { MarkdownImageNode } from '../../src/markdown-render/nodes/image.js';
import { MarkdownInlineCodeNode } from '../../src/markdown-render/nodes/inline-code.js';
import { MarkdownNodeLifecycleContext } from '../../src/markdown-render/nodes/lifecycle.js';
import { MarkdownLinkNode } from '../../src/markdown-render/nodes/link.js';
import '../../styles/markdown-render.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(query.has('loading'));
  const [events, setEvents] = useState<string[]>([]);
  const [imageEvents, setImageEvents] = useState<string[]>([]);
  const [imageKey, setImageKey] = useState('image');
  const [imageMounted, setImageMounted] = useState(true);
  const [imageLoading, setImageLoading] = useState(query.has('image-loading'));
  const [imageSrc, setImageSrc] = useState(
    query.has('image-unsafe') ? 'javascript:alert(1)' : '/markdown-original.svg',
  );
  const imageRecord = (event: string) => setImageEvents((old) => [...old, event]);
  const record = (type: string) => (event: MouseEvent) =>
    setEvents((old) => [...old, `${type}:${event.type}:${event instanceof MouseEvent}`]);
  const handlers = {
    onClick: record('click'),
    onMouseOver: record('over'),
    onMouseOut: record('out'),
  };
  const ctx: RenderContext = {
    htmlPolicy: 'safe',
    events: {},
    showTooltips: !query.has('no-tooltip'),
    customComponents: {
      link: MarkdownLinkNode,
      heading: MarkdownContainerNode,
      blockquote: MarkdownContainerNode,
    },
  };
  const text = (content: string) => ({ type: 'text' as const, content, raw: content });
  return (
    <>
      <button onClick={() => setLoading(!loading)}>Loading</button>
      <output data-testid="events">{events.join('|')}</output>
      <div className="sd-markdown-render">
        <section data-testid="headings">
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <MarkdownContainerNode
              key={level}
              node={{
                type: 'heading',
                level,
                attrs: { id: `heading-${level}`, class: 'own-heading' },
                children: [text(`Heading ${level}`)],
              }}
              ctx={ctx}
            />
          ))}
        </section>
        <MarkdownContainerNode
          {...handlers}
          node={{
            type: 'blockquote',
            cite: 'https://example.com/source',
            children: [text('Quoted text')],
          }}
          ctx={ctx}
        />
        <div data-testid="link">
          <MarkdownLinkNode
            {...handlers}
            ctx={ctx}
            color="rgb(100, 50, 20)"
            node={{
              type: 'link',
              href: query.has('unsafe')
                ? 'javascript:alert(1)'
                : query.has('anchor')
                  ? '#heading-1'
                  : 'https://example.com/path',
              title: 'Link title',
              text: 'Streaming link',
              loading,
              attrs: [
                ['class', 'node-link'],
                ['rel', 'author opener'],
              ],
              children: [text('Complete link')],
            }}
            hostAttrs={{ 'onclick': 'throw Error(1)', 'style': 'color:red', 'data-owner': 'node' }}
          />
        </div>
        <MarkdownInlineCodeNode
          node={{ type: 'inline_code', code: 'const a = 1', raw: '`const a = 1`' }}
        />
        <MarkdownInlineCodeNode node={{ type: 'inline_code', code: 'hidden', raw: '' }}>
          <b data-testid="code-slot">Custom code</b>
        </MarkdownInlineCodeNode>
        <MarkdownCheckboxNode node={{ checked: true }} />
        <MarkdownCheckboxNode node={{ checked: false }} />
        <MarkdownAdmonitionNode
          node={{
            type: 'admonition',
            kind: 'warning',
            title: 'Warning title',
            children: [text('Warning body')],
          }}
          ctx={ctx}
        />
        <MarkdownAdmonitionNode
          node={{
            type: 'admonition',
            kind: 'tip',
            title: 'More details',
            collapsible: true,
            children: [text('Collapsible body')],
          }}
          ctx={ctx}
        />
        <output data-testid="image-events">{imageEvents.join('|')}</output>
        <button onClick={() => setImageSrc('/markdown-next.svg')}>Next image</button>
        <button onClick={() => setImageLoading(false)}>Finish image token</button>
        <button onClick={() => setImageMounted(false)}>Remove image node</button>
        <MarkdownNodeLifecycleContext
          value={{
            markPending: (key) => imageRecord(`pending:${key}`),
            markSettled: (key) => imageRecord(`settled:${key}`),
            reportHeight: (key, height) => imageRecord(`height:${key}:${height}`),
          }}
        >
          {imageMounted && (
            <MarkdownImageNode
              indexKey={imageKey}
              node={{
                type: 'image',
                src: imageSrc,
                alt: 'Markdown picture',
                title: 'Image caption',
                raw: '',
                loading: imageLoading,
              }}
              fallbackSrc={query.has('image-fallback') ? '/markdown-fallback.svg' : ''}
              lazy={query.has('image-lazy')}
              onLoad={(src) => {
                imageRecord(`load:${src}`);
                if (query.has('replace-on-load')) {
                  setImageKey('replacement');
                  setImageLoading(true);
                }
              }}
              onError={(src) => imageRecord(`error:${src}`)}
              onClick={([event, src]) => imageRecord(`click:${event.type}:${src}`)}
              renderPlaceholder={({ displaySrc }) => (
                <span data-testid="image-placeholder">{displaySrc}</span>
              )}
              renderError={({ displaySrc }) => (
                <span data-testid="image-error">{displaySrc || 'No source'}</span>
              )}
            />
          )}
        </MarkdownNodeLifecycleContext>
      </div>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
