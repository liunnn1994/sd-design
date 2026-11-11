import type { ToolbarModelValue } from '@sdata/web-core/toolbar/types';

import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useToolbar } from '../../src/toolbar/use-toolbar.js';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [value, setValue] = useState<ToolbarModelValue>({
    term: 'initial',
    keep: 'original',
    nested: { count: 1 },
  });
  const [accept, setAccept] = useState(false);
  const [allowExpand, setAllowExpand] = useState(true);
  const [wide, setWide] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const body = useRef<HTMLDivElement>(null);
  const record = (event: string) => setEvents((items) => [...items, event]);
  const state = useToolbar(
    {
      value: query.has('controlled') ? value : undefined,
      defaultValue: value,
      resetSkipKeys: ['keep'],
      allowExpand,
      itemHeight: 32,
      schemas: [
        {
          span: 2,
          slotName: 'field',
          formItemProps: { style: { color: 'red' } },
          children: [{ slotName: 'nested' }],
        },
        { span: 0, slotName: 'field' },
      ],
      onValueChange: (next) => {
        record('value');
        if (accept) setValue(next);
      },
      onSearch: (next) => record(`search:${String(next.term)}`),
      onReset: () => record('reset'),
    },
    () => record('clear'),
  );
  return (
    <div
      onKeyDown={(event) => {
        if (event.key === 'Enter') state.foundation.onEnter(event.nativeEvent);
      }}
    >
      <button
        onClick={() =>
          state.setValue({ term: 'edited', keep: 'retained', nested: { count: 9 }, added: true })
        }
      >
        Edit
      </button>
      <button onClick={() => state.foundation.reset()}>Reset</button>
      <button onClick={() => state.foundation.reset(false)}>Silent reset</button>
      <button onClick={state.foundation.handleSearch}>Search</button>
      <button onClick={() => setAccept(true)}>Accept</button>
      <button onClick={() => setValue({ term: 'external', keep: 'external' })}>External</button>
      <button onClick={() => state.foundation.measure({ target: body.current! })}>Measure</button>
      <button onClick={state.foundation.toggleExpand}>Expand</button>
      <button onClick={() => setAllowExpand(!allowExpand)}>Allow expand</button>
      <button onClick={() => setWide(!wide)}>Size</button>
      <input aria-label="Search input" />
      <input aria-label="Prevented" onKeyDown={(event) => event.preventDefault()} />
      <textarea aria-label="Multiline" />
      <div contentEditable suppressContentEditableWarning aria-label="Editable">
        text
      </div>
      <div ref={body} style={{ height: wide ? 96 : 32 }}>
        Content
      </div>
      <output data-testid="value">{JSON.stringify(state.value)}</output>
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="height">{state.bodyMaxHeight}</output>
      <output data-testid="overflow">{String(state.overflow)}</output>
      <output data-testid="schemas">{JSON.stringify(state.schemas)}</output>
      <output data-testid="slots">{state.schemaSlotNames.join(',')}</output>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
