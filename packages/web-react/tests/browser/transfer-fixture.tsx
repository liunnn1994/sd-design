import { useRef, useState } from 'react';

import { CheckboxGroup } from '../../src/checkbox/index.js';
import { Form, FormItem } from '../../src/form/index.js';
import { Transfer } from '../../src/transfer/index.js';

const data = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta', disabled: true },
  { value: 'c', label: 'Gamma' },
  { value: 'd', label: 'Delta' },
];

export function TransferFixture() {
  const [value, setValue] = useState<string[]>(['d']);
  const [selected, setSelected] = useState<string[]>([]);
  const [controlled, setControlled] = useState(false);
  const [accept, setAccept] = useState(true);
  const [simple, setSimple] = useState(false);
  const [oneWay, setOneWay] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);
  const [custom, setCustom] = useState(false);
  const [panel, setPanel] = useState(false);
  const [headers, setHeaders] = useState(false);
  const [selectAll, setSelectAll] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const record = (event: string) => setEvents((old) => [...old, event]);
  return (
    <section data-testid="transfer-fixture" style={{ padding: 24 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button onClick={() => setControlled(!controlled)}>Transfer controlled</button>
        <button onClick={() => setAccept(!accept)}>Transfer accept</button>
        <button onClick={() => setSimple(!simple)}>Transfer simple</button>
        <button onClick={() => setOneWay(!oneWay)}>Transfer one way</button>
        <button onClick={() => setDisabled(!disabled)}>Transfer disabled</button>
        <button onClick={() => setFormDisabled(!formDisabled)}>Transfer form disabled</button>
        <button onClick={() => setCustom(!custom)}>Transfer custom item</button>
        <button onClick={() => setPanel(!panel)}>Transfer custom panels</button>
        <button onClick={() => setHeaders(!headers)}>Transfer custom titles</button>
        <button onClick={() => setSelectAll(!selectAll)}>Transfer select all</button>
        <button
          onClick={() => {
            setValue(['b', 'd']);
            setSelected(['b']);
          }}
        >
          Transfer disabled values
        </button>
        <button onClick={() => record(`ref:${root.current?.tagName}`)}>Transfer read ref</button>
        <button onClick={() => setEvents([])}>Transfer clear events</button>
      </div>
      <Form model={{ value }} disabled={formDisabled}>
        <FormItem field="value" label="Pick items">
          <CheckboxGroup value={['b']} disabled>
            <Transfer
              ref={root}
              data={data}
              value={controlled ? value : undefined}
              defaultValue={['d']}
              selected={controlled ? selected : undefined}
              disabled={disabled}
              simple={simple}
              oneWay={oneWay}
              showSearch
              showSelectAll={selectAll}
              title={['Available', 'Chosen']}
              sourceInputSearchProps={{
                placeholder: 'Search source',
                allowClear: true,
                inputAttrs: { 'aria-label': 'Transfer source search' },
              }}
              targetInputSearchProps={{
                placeholder: 'Search target',
                allowClear: true,
                inputAttrs: { 'aria-label': 'Transfer target search' },
              }}
              onValueChange={(next) => {
                record(`value:${next.join(',')}`);
                if (accept) setValue(next);
              }}
              onChange={(next) => record(`change:${next.join(',')}`)}
              onSelectedChange={(next) => {
                record(`selected:${next.join(',')}`);
                if (accept) setSelected(next);
              }}
              onSelect={(next) => record(`select:${next.join(',')}`)}
              onSearch={(text, direction) => record(`search:${direction}:${text}`)}
              renderItem={
                custom
                  ? ({ value, label }) => (
                      <b data-testid={`transfer-custom-${value}`}>
                        {value}:{label}
                      </b>
                    )
                  : undefined
              }
              renderSource={
                panel
                  ? ({ data, selectedKeys, onSelect }) => (
                      <div data-testid="transfer-source-panel">
                        {data.map((item) => (
                          <button
                            key={item.value}
                            disabled={item.disabled}
                            onClick={() => onSelect([...selectedKeys, item.value])}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )
                  : undefined
              }
              renderTarget={
                panel
                  ? ({ data }) => (
                      <div data-testid="transfer-target-panel">
                        {data.map((item) => item.label).join(',')}
                      </div>
                    )
                  : undefined
              }
              renderSourceTitle={
                headers
                  ? (state) => (
                      <button
                        data-testid="transfer-source-title"
                        onClick={() => state.onSelectAllChange(!state.checked)}
                      >
                        {state.countSelected}/{state.countTotal}:{state.searchValue}:
                        {String(state.checked)}:{String(state.indeterminate)}
                      </button>
                    )
                  : undefined
              }
              renderTargetTitle={
                headers
                  ? (state) => (
                      <button data-testid="transfer-target-title" onClick={state.onClear}>
                        Clear {state.countTotal}
                      </button>
                    )
                  : undefined
              }
              toTargetIcon={custom ? <b data-testid="transfer-forward-icon">Forward</b> : undefined}
              toSourceIcon={custom ? <b data-testid="transfer-back-icon">Back</b> : undefined}
            />
          </CheckboxGroup>
        </FormItem>
      </Form>
      <output data-testid="transfer-value">{value.join(',')}</output>
      <output data-testid="transfer-selected">{selected.join(',')}</output>
      <output data-testid="transfer-events">{events.join('|')}</output>
    </section>
  );
}
