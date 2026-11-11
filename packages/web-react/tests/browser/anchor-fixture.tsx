import { useState } from 'react';

import { Anchor, AnchorLink } from '../../src/index';

export function AnchorFixture() {
  const [mounted, setMounted] = useState(false);
  const [href, setHref] = useState('#anchor-a1');
  const [showFirst, setShowFirst] = useState(true);
  const [second, setSecond] = useState(false);
  const [horizontal, setHorizontal] = useState(false);
  const [lineLess, setLineLess] = useState(false);
  const [affix, setAffix] = useState(false);
  const [smooth, setSmooth] = useState(false);
  const [changeHash, setChangeHash] = useState(false);
  const [boundary, setBoundary] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  return (
    <section>
      <button onClick={() => setMounted(!mounted)}>
        {mounted ? 'Unmount Anchor' : 'Mount Anchor'}
      </button>
      {mounted && (
        <>
          <button onClick={() => setEvents([])}>Clear Anchor events</button>
          <button onClick={() => setHref('#anchor-a3')}>Rename Anchor link</button>
          <button onClick={() => setShowFirst(!showFirst)}>Toggle Anchor link</button>
          <button onClick={() => setSecond(!second)}>Switch Anchor container</button>
          <button onClick={() => setHorizontal(!horizontal)}>Toggle Anchor direction</button>
          <button onClick={() => setLineLess(!lineLess)}>Toggle Anchor line</button>
          <button onClick={() => setAffix(!affix)}>Toggle Anchor affix</button>
          <button onClick={() => setSmooth(!smooth)}>Toggle Anchor smooth</button>
          <button onClick={() => setChangeHash(!changeHash)}>Toggle Anchor hash</button>
          <button onClick={() => setBoundary(boundary ? 0 : 20)}>Toggle Anchor boundary</button>
          <div id="anchor-sections-a" style={{ height: 180, overflow: 'auto' }}>
            {['anchor-a1', 'anchor-a2', 'anchor-a3', 'anchor:100%'].map((id) => (
              <section id={id} key={id} style={{ height: 200 }}>
                {id}
              </section>
            ))}
          </div>
          <div id="anchor-sections-b" style={{ height: 180, overflow: 'auto' }}>
            {['anchor-b1', 'anchor-b2'].map((id) => (
              <section id={id} key={id} style={{ height: 200 }}>
                {id}
              </section>
            ))}
          </div>
          <Anchor
            data-testid="anchor"
            scrollContainer={second ? '#anchor-sections-b' : '#anchor-sections-a'}
            direction={horizontal ? 'horizontal' : 'vertical'}
            lineLess={lineLess}
            affix={affix}
            affixStyle={{ width: 300 }}
            offsetTop={600}
            targetOffset={100}
            boundary={boundary}
            smooth={smooth}
            changeHash={changeHash}
            onSelect={(hash, previous) =>
              setEvents((value) => [...value, `select:${hash}:${previous}`])
            }
            onChange={(hash) => setEvents((value) => [...value, `change:${hash}`])}
          >
            {showFirst && <AnchorLink href={href} title="Dynamic anchor" />}
            <Anchor.Link
              href="#anchor-a2"
              title="Second anchor"
              sublist={<AnchorLink href="#anchor:100%">Literal anchor</AnchorLink>}
            />
            <AnchorLink href="#anchor-b1" title="B first" />
            <AnchorLink href="#anchor-b2" title="B second" />
          </Anchor>
        </>
      )}
      <output data-testid="anchor-events">{events.join('|')}</output>
    </section>
  );
}
