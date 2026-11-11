import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ConfigProvider } from '../../src/config-provider/index.js';
import enUS from '../../src/locale/lang/en-us.js';
import { Toolbar, type ToolbarInstance, type ToolbarModelValue } from '../../src/toolbar/index.js';
import '../../styles/toolbar.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const initial = useRef<ToolbarModelValue>({ filter: { name: 'Initial' }, keep: 'original' });
  const [model, setModel] = useState(initial.current);
  const [events, setEvents] = useState<string[]>([]);
  const [snapshot, setSnapshot] = useState('');
  const [english, setEnglish] = useState(false);
  const [width, setWidth] = useState(1000);
  const [actions, setActions] = useState(true);
  const api = useRef<ToolbarInstance>(null);
  const controlled = !query.has('uncontrolled');
  const record = (event: string) => setEvents((old) => [...old, event]);
  return (
    <ConfigProvider
      locale={english ? enUS : undefined}
      toolbarSpinProps={{ tip: 'Provider loading', dot: true, delay: 0 }}
    >
      <button onClick={() => api.current?.search()}>Ref search</button>
      <button onClick={() => api.current?.reset(false)}>Silent reset</button>
      <button
        onClick={() =>
          setModel({ filter: { name: 'Edited' }, keep: 'preserved', added: 'temporary' })
        }
      >
        Replace model
      </button>
      <button
        onClick={() => {
          api.current?.search();
        }}
      >
        Read model
      </button>
      <button onClick={() => setEnglish(!english)}>Language</button>
      <button onClick={() => setWidth(width === 1000 ? 420 : 1000)}>Resize</button>
      <button onClick={() => setActions(!actions)}>Actions</button>
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="snapshot">{snapshot}</output>
      <div style={{ width }}>
        <Toolbar
          ref={api}
          value={controlled ? model : undefined}
          defaultValue={initial.current}
          resetSkipKeys={['keep']}
          allowExpand
          defaultExpand={query.has('expanded')}
          itemHeight={32}
          spanWidth={230}
          itemMaxWidth={query.has('max') ? '250px' : undefined}
          loading={query.has('loading')}
          spinProps={query.has('local-spin') ? { tip: 'Local loading' } : undefined}
          showActions={actions}
          showSearch={!query.has('no-search')}
          showReset={!query.has('no-reset')}
          searchText={query.has('text') ? 'Go' : undefined}
          searchBtn={
            query.has('anchor')
              ? {
                  href: '#query',
                  onClick: (event) => {
                    event.preventDefault();
                    record('button');
                  },
                }
              : undefined
          }
          onValueChange={(next) => {
            record('model');
            setModel(next);
          }}
          onSearch={(next) => {
            record('search');
            setSnapshot(JSON.stringify(next));
          }}
          onReset={() => record('reset')}
          extra={query.has('extra') ? <b data-testid="extra">Extra actions</b> : undefined}
          actionPrepend={<span data-testid="prepend">Before</span>}
          actionAppend={<span data-testid="append">After</span>}
          slots={{
            custom: ({ record: schema }) => <b data-testid="custom">Slot:{schema.field}</b>,
            extra: () => <b data-testid="leak">Leaked action slot</b>,
          }}
          schemas={[
            { field: 'filter.name', type: 'input', label: 'Name', required: true, span: 2 },
            { field: 'keep', type: 'input', label: 'Keep' },
            { field: 'custom', slotName: 'custom', label: 'Custom' },
          ]}
        >
          {query.has('children') ? (
            <>
              <input data-testid="manual-input" />
              <textarea data-testid="manual-textarea" />
              <div contentEditable suppressContentEditableWarning data-testid="manual-editable">
                Edit
              </div>
              <button>Manual button</button>
              <a href="#manual">Manual link</a>
            </>
          ) : undefined}
        </Toolbar>
      </div>
    </ConfigProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
