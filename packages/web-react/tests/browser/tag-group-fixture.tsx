import { useMemo, useRef, useState } from 'react';

import { TagGroup } from '../../src/index';
export function TagGroupFixture() {
  const [mounted, setMounted] = useState(false);
  const [wide, setWide] = useState(false);
  const [more, setMore] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [limit, setLimit] = useState(1);
  const [closed, setClosed] = useState(0);
  const [label, setLabel] = useState(false);
  const [refTag, setRefTag] = useState('');
  const ref = useRef<HTMLSpanElement>(null);
  const fixed = useMemo(
    () => [
      {
        label: 'Closable',
        value: 0,
        color: 'red',
        itemProps: {
          closable: true,
          className: 'custom-group-tag',
          visible: false,
          nowrap: false,
          onClose: () => setClosed((n) => n + 1),
        },
      },
      'Hidden one',
      'Hidden two',
    ],
    [],
  );
  const responsive = useMemo(
    () => (more ? ['one', 'two', 'three', 'four'] : ['one', 'two', 'three']),
    [more],
  );
  return (
    <section>
      <button onClick={() => setMounted(!mounted)}>
        {mounted ? 'Unmount TagGroup' : 'Mount TagGroup'}
      </button>
      {mounted && (
        <>
          <button onClick={() => setWide(!wide)}>Resize TagGroup</button>
          <button onClick={() => setMore(!more)}>Append TagGroup option</button>
          <button onClick={() => setEmpty(!empty)}>Empty TagGroup</button>
          <button onClick={() => setLimit(limit ? 0 : 1)}>Toggle TagGroup limit</button>
          <button onClick={() => setLabel(!label)}>Toggle TagGroup label</button>
          <button onClick={() => setRefTag(ref.current?.tagName ?? '')}>Read TagGroup ref</button>
          <output data-testid="tag-group-close">{closed}</output>
          <output data-testid="tag-group-ref">{refTag}</output>
          <TagGroup
            ref={ref}
            data-testid="tag-group-fixed"
            options={empty ? [] : fixed}
            maxCount={limit}
          >
            No tags
          </TagGroup>
          <div style={{ width: wide ? 600 : 120 }}>
            <TagGroup data-testid="tag-group-responsive" options={responsive} />
          </div>
          <TagGroup
            data-testid="tag-group-custom"
            maxCount={1}
            fieldNames={{ label: 'name', value: 'id' }}
            options={[
              { name: 'Docs', id: 'docs', href: '#docs' },
              { name: 'Help', id: 'help', href: '#help' },
            ]}
            renderItem={({ data, label, value, index, itemClass, measure, isOverflow }) => (
              <a
                href={String(data.href)}
                className={itemClass}
                data-context={`${value}:${index}:${measure}:${isOverflow}`}
              >
                {label}
              </a>
            )}
            renderCounter={({ hiddenCount, counterClass }) => (
              <button className={counterClass}>More {hiddenCount}</button>
            )}
          />
          <TagGroup
            data-testid="tag-group-label"
            maxCount={0}
            options={[{ label: () => (label ? 'Second label' : 'First label'), value: 'function' }]}
            renderLabel={label ? ({ data }) => <b>Custom {data.value}</b> : undefined}
          />
        </>
      )}
    </section>
  );
}
