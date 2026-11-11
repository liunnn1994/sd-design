import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useCascaderInteraction } from '../../src/cascader/use-interaction.js';
import { useCascaderOptions } from '../../src/cascader/use-options.js';

function Fixture({ record }: { record(value: string): void }) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [controlled, setControlled] = useState<string | undefined>(undefined);
  const [active, setActive] = useState<string>();
  const [path, setPath] = useState<string>();
  const data = useCascaderOptions({ options: [{ value: 'root', children: [{ value: 'leaf' }] }] });
  const state = useCascaderInteraction(
    {
      inputValue: controlled,
      popupVisible: visible,
      allowSearch: true,
      searchDelay: 200,
      onInputValueChange: (value) => record(`input:${value}`),
      onSearch: (value) => record(`search:${value}`),
      onClear: () => record('clear'),
    },
    {
      getValues: () => (selected ? new Map([['root-leaf', 'leaf']]) : new Map()),
      getLeafOptions: () => data.leafOptionMap,
      getActiveKey: () => active,
      setPopupVisible: setVisible,
      setSelectedPath: setPath,
      setActiveKey: setActive,
      clearSelection: () => {
        if (blocked) return false;
        setSelected(false);
        return true;
      },
    },
  );
  return (
    <>
      <input
        value={state.inputValue}
        onChange={(event) => state.inputChange(event.target.value, 'manual')}
      />
      <button onClick={() => setVisible((value) => !value)}>Toggle</button>
      <button onClick={() => setSelected(true)}>Select</button>
      <button onClick={() => setBlocked(true)}>Block</button>
      <button onClick={() => setControlled('fixed')}>Control</button>
      <button onClick={() => setControlled(undefined)}>Release</button>
      <button onClick={state.clear}>Clear</button>
      <output data-testid="state">
        {JSON.stringify({ visible, search: state.showSearchPanel, active, path })}
      </output>
    </>
  );
}
function App() {
  const [mounted, setMounted] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  return (
    <>
      <button onClick={() => setMounted(false)}>Unmount</button>
      {mounted && <Fixture record={(value) => setEvents((items) => [...items, value])} />}
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
