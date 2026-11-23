import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { MarkdownHtmlNode } from '../../src/markdown-render/nodes/html.js';
import '../../styles/markdown-render.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [policy, setPolicy] = useState<'safe' | 'escape' | 'trusted'>(
    query.has('safe') || query.has('policy-update')
      ? 'safe'
      : query.has('escape')
        ? 'escape'
        : 'trusted',
  );
  const [next, setNext] = useState(false);
  const [restyle, setRestyle] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const content = query.has('custom')
    ? '<x-notes label="Notes"><b>Custom body</b></x-notes>'
    : query.has('unsafe')
      ? '<p>Safe body</p><script>document.body.dataset.injected="yes"</script><a href="javascript:alert(1)" onclick="document.body.dataset.injected=\'yes\'">Unsafe link</a>'
      : `<h2 id="html-heading" class="own-heading" style="${restyle ? 'color:rgb(60,50,40)' : 'color:rgb(12,34,56)!important;color:red'}; font-family:'a;b'; --Token:'x;y'">Heading &amp; title</h2><p id="html-paragraph">A &amp; B <a id="html-link" href="#html-heading">local link</a> end <button id="html-button" type="reset" disabled="false" style="padding-left:${next ? 17 : 9}px">Native button</button><img src="/markdown-html.svg" alt="HTML picture" class="html-image" style="border-radius:5px" /></p><p><label for="html-input">Input label</label><input id="html-input" value="${next ? 'Next' : 'First'}" /><input id="html-check" type="checkbox" checked /></p><span style="padding-left:7px; broken; color:blue">Malformed CSS</span>`;
  const nodeContent = query.has('whitespace')
    ? '<p id="html-spacing"><a href="#one">one</a>\n\t<a href="#two">two</a></p><p id="html-entity" aria-label="A &amp; B">&lt;em&gt;literal&lt;/em&gt;</p>'
    : query.has('policy-update')
      ? next
        ? '<p><button type="reset">Updated</button></p>'
        : '<p>Original</p>'
      : content;
  return (
    <>
      <button onClick={() => setNext(!next)}>Change HTML</button>
      <button onClick={() => setRestyle(!restyle)}>Restyle HTML</button>
      {query.has('policy-update') && (
        <button onClick={() => setPolicy(policy === 'safe' ? 'trusted' : 'safe')}>
          Toggle HTML policy
        </button>
      )}
      <output data-testid="html-events">{events.join('|')}</output>
      <div className="sd-markdown-render" data-testid="html-fixture">
        <MarkdownHtmlNode
          node={{
            type: query.has('inline') ? 'html_inline' : 'html_block',
            content: nodeContent,
            loading: query.has('loading'),
          }}
          htmlPolicy={query.has('policy-update') ? undefined : policy}
          ctx={{
            htmlPolicy: policy,
            final: !query.has('loading'),
            events: {},
            htmlComponents: {
              'x-notes': ({ children, label }) => (
                <aside data-testid="custom-html" aria-label={label}>
                  {children}
                </aside>
              ),
            },
          }}
          onClick={(event) =>
            setEvents((old) => [...old, `${event.type}:${event instanceof MouseEvent}`])
          }
        />
      </div>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
