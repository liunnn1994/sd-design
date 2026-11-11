import { useRef, useState } from 'react';

import type { ClampExposed } from '../../src/clamp/index';

import { LineClamp, InlineClamp } from '../../src/clamp/index';

const text = 'START ' + 'Text with repeated words and 👩‍👩‍👧‍👦 unicode families. '.repeat(12) + ' END';
export function LineFixture() {
  const [expanded, setExpanded] = useState(false);
  const [wide, setWide] = useState(false);
  const [short, setShort] = useState(false);
  const [clamped, setClamped] = useState(false);
  const native = useRef<ClampExposed>(null);
  return (
    <section>
      <div style={{ width: wide ? 500 : 180 }}>
        <InlineClamp
          data-testid="inline-split"
          text={
            short
              ? '/docs/Short.pdf'
              : '/docs/' + 'Long report name with unicode 👩‍👩‍👧‍👦 '.repeat(8) + '.pdf'
          }
          split={(value) => ({ start: '/docs/', body: value.slice(6, -4), end: '.pdf' })}
          location="middle"
        />
      </div>
      <InlineClamp data-testid="inline-native" text={text} style={{ width: 180 }} />
      <LineClamp
        data-testid="line-native"
        ref={native}
        text={short ? 'Short' : text}
        maxLines={2}
        onClampChange={setClamped}
        style={{ width: wide ? 700 : 220, lineHeight: '20px' }}
      />
      <output data-testid="line-clamped">{String(clamped)}</output>
      <button onClick={() => native.current?.expand()}>展开纯文本</button>
      <button onClick={() => native.current?.collapse()}>收起纯文本</button>
      <button onClick={() => setShort(!short)}>切换纯文本</button>
      <button onClick={() => setWide(!wide)}>切换文本宽度</button>
      <LineClamp
        data-testid="line-middle"
        text={text}
        maxLines={2}
        location="middle"
        ellipsis=" [cut] "
        expanded={expanded}
        onExpandedChange={setExpanded}
        style={{ width: 260, lineHeight: '20px' }}
        after={({ expanded, toggle }) => (
          <button type="button" onClick={toggle}>
            {expanded ? '折叠中部' : '展开中部'}
          </button>
        )}
      />
      <LineClamp
        data-testid="line-start"
        text={text}
        maxLines={1}
        location="start"
        ellipsis=" [cut] "
        style={{ width: wide ? 500 : 160, lineHeight: '20px' }}
      />
      <LineClamp
        data-testid="line-height"
        text={text}
        maxHeight={40}
        style={{ width: 220, lineHeight: '20px' }}
      />
    </section>
  );
}
