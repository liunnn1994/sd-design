import { StrictMode, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import { Checkbox } from '../../src/checkbox/index.js';
import { ConfigProvider } from '../../src/config-provider/index.js';
import { Input } from '../../src/input/index.js';
import { JsonFormControl } from '../../src/json-form/control.js';
import enUS from '../../src/locale/lang/en-us.js';
import { Radio } from '../../src/radio/index.js';
import { Switch } from '../../src/switch/index.js';
import '../../styles/input.scss';
import '../../styles/checkbox.scss';
import '../../styles/radio.scss';
import '../../styles/switch.scss';

function Custom({
  value,
  onValueChange,
  renderTail,
  children,
}: {
  value?: unknown;
  onValueChange?(value: unknown): void;
  renderTail?(value: unknown): ReactNode;
  children?: ReactNode;
}) {
  return (
    <div>
      <button onClick={() => onValueChange?.('custom')}>Custom update</button>
      {children}
      {renderTail?.(value)}
    </div>
  );
}
const components = {
  input: Input,
  checkbox: Checkbox,
  radio: Radio,
  switch: Switch,
  custom: Custom,
};
function Fixture() {
  const query = new URLSearchParams(location.search);
  const kind = query.get('type') ?? 'input';
  const [value, setValue] = useState<unknown>(['switch', 'checkbox'].includes(kind) ? false : '');
  const [english, setEnglish] = useState(false);
  const [override, setOverride] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const record = (event: string) => setEvents((items) => [...items, event]);
  return (
    <>
      <button onClick={() => setEnglish(!english)}>Language</button>
      <button onClick={() => setOverride(!override)}>Slots</button>
      <ConfigProvider locale={english ? enUS : undefined}>
        <JsonFormControl
          components={components}
          prefixCls="sd-json-form"
          value={value}
          onValueChange={(next) => {
            setValue(next);
            record(`value:${String(next)}`);
          }}
          slots={{
            renderTail: (next: unknown) => <span data-testid="tail">Forwarded {String(next)}</span>,
          }}
          schema={{
            type: kind,
            label: 'Name',
            componentProps: {
              className: 'custom-control',
              placeholder: query.has('empty') ? '' : undefined,
              value: kind === 'radio' ? 'choice' : undefined,
              onValueChange: () => record('props-update'),
              onChange: () => record('props-change'),
            },
            componentEvents: {
              onValueChange: () => record('event-update'),
              onChange: () => record('event-change'),
            },
            componentSlots:
              kind === 'custom'
                ? {
                    default: () => <span data-testid="default-slot">Default content</span>,
                    ...(override
                      ? {
                          renderTail: (next: unknown) => (
                            <span data-testid="tail">Override {String(next)}</span>
                          ),
                        }
                      : {}),
                  }
                : undefined,
          }}
        />
      </ConfigProvider>
      <output data-testid="value">{String(value)}</output>
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
