import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Cascader } from '../../src/cascader/cascader.js';
import '../../styles/select.scss';
import '../../styles/checkbox.scss';
import '../../styles/radio.scss';
import '../../../web-core/styles/cascader/style/index.scss';

const options = [
  {
    value: 'root',
    label: 'Root',
    children: [
      { value: 0, label: 'Zero' },
      { value: 1, label: 'One' },
    ],
  },
];
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [events, setEvents] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [accept, setAccept] = useState(false);
  const [show, setShow] = useState(false);
  const record = (event: string) => setEvents((items) => [...items, event]);
  return (
    <>
      <button onClick={() => setDisabled(true)}>Disable</button>
      <button onClick={() => setReadonly(true)}>Readonly</button>
      <button onClick={() => setAccept(true)}>Accept</button>
      <Cascader
        style={{ width: 260 }}
        options={options}
        allowClear
        allowSearch
        multiple={query.has('multiple')}
        searchDelay={20}
        disabled={disabled}
        readonly={readonly ? 'Locked field' : false}
        show={query.has('controlled') ? show : undefined}
        onShowChange={(next) => {
          record(`show:${next}`);
          if (accept) setShow(next);
        }}
        defaultValue={query.has('fallback') ? 'missing' : undefined}
        onChange={(value) => record(`change:${JSON.stringify(value)}`)}
        onSearch={(value) => record(`search:${value}`)}
        onClear={() => record('clear')}
        renderTrigger={
          query.has('custom')
            ? (state) => (
                <button data-testid="custom">
                  {state.displayValue || 'Choose'}:{String(state.popupVisible)}
                </button>
              )
            : undefined
        }
      />
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
