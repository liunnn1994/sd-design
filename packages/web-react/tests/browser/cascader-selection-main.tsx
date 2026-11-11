import type { CascaderModelValue } from '@sdata/web-core/cascader/types';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useCascaderOptions } from '../../src/cascader/use-options.js';
import { useCascaderSelection } from '../../src/cascader/use-selection.js';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [multiple, setMultiple] = useState(query.has('multiple'));
  const [pathMode, setPathMode] = useState(query.has('path'));
  const [strict, setStrict] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [accept, setAccept] = useState(false);
  const [value, setValue] = useState<CascaderModelValue>(
    query.has('controlled') ? 'one' : undefined,
  );
  const [events, setEvents] = useState<string[]>([]);
  const record = (name: string) => setEvents((items) => [...items, name]);
  const data = useCascaderOptions({
    checkStrictly: strict,
    options: [
      {
        value: 'root',
        children: [{ value: 'one' }, { value: 'two' }, { value: 'locked', disabled: true }],
      },
    ],
  });
  const state = useCascaderSelection(
    {
      value,
      defaultValue: query.has('locked') ? ['locked', 'missing'] : undefined,
      multiple,
      pathMode,
      checkStrictly: strict,
      readonly,
      onValueChange: (next) => {
        record('update');
        if (accept) setValue(next);
      },
      onChange: () => record('change'),
    },
    {
      ...data,
      setSelectedPath: () => record('path-reset'),
      setActiveKey: () => record('active-reset'),
      onReadonly: () => record('readonly'),
      onFormChange: () => record('form'),
      afterSingleSelect: () => record('single'),
      afterMultipleSelect: () => record('multiple'),
    },
  );
  return (
    <>
      <button onClick={() => state.foundation.click(data.optionMap.get('root')!)}>Parent</button>
      <button onClick={() => state.foundation.click(data.optionMap.get('root-one')!)}>One</button>
      <button onClick={() => state.foundation.click(data.optionMap.get('root-two')!)}>Two</button>
      <button onClick={() => state.foundation.click(data.optionMap.get('root-locked')!)}>
        Locked
      </button>
      <button
        onClick={() => {
          state.foundation.click(data.optionMap.get('root-one')!);
          state.foundation.click(data.optionMap.get('root-two')!);
        }}
      >
        Both
      </button>
      <button onClick={() => state.foundation.click(data.optionMap.get('root')!, false)}>
        Uncheck parent
      </button>
      <button onClick={() => state.foundation.remove('missing')}>Remove missing</button>
      <button onClick={() => state.foundation.clear()}>Clear</button>
      <button onClick={() => setMultiple(!multiple)}>Multiple</button>
      <button onClick={() => setPathMode(!pathMode)}>Path</button>
      <button onClick={() => setStrict(!strict)}>Strict</button>
      <button onClick={() => setReadonly(!readonly)}>Readonly</button>
      <button onClick={() => setAccept(true)}>Accept</button>
      <button onClick={() => setValue(undefined)}>Release</button>
      <button onClick={() => setValue('two')}>External</button>
      <button onClick={() => setEvents([])}>Reset events</button>
      <output data-testid="value">{JSON.stringify(state.value) ?? 'undefined'}</output>
      <output data-testid="keys">{[...state.valueMap.keys()].join(',')}</output>
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
