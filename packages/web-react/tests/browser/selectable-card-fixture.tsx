import { useRef, useState } from 'react';

import { ConfigProvider } from '../../src/config-provider/index.js';
import { SelectableCard } from '../../src/selectable-card/index.js';
export function SelectableCardFixture() {
  const [selected, setSelected] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [alternate, setAlternate] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const log = (value: string) => setEvents((old) => [...old, value]);
  return (
    <section data-testid="selectable-fixture">
      <SelectableCard
        ref={root}
        data-testid="selectable-main"
        label="Main plan"
        isSelected={selected}
        isDisabled={disabled}
        onChange={(value) => {
          log(`change:${value}`);
          setSelected(value);
        }}
        title={<strong>Main title</strong>}
        value={0}
        description="Plan details"
        figure={<span>Figure</span>}
        color={alternate ? 'green' : 'sdblue'}
        variant={alternate ? 'filled' : 'outline'}
        size={alternate ? 'large' : 'medium'}
        layout={alternate ? 'horizontal' : 'vertical'}
        align={alternate ? 'center' : 'start'}
        padding={alternate ? '20px 24px' : 2}
        width={alternate ? '280px' : 320}
        height={alternate ? 260 : undefined}
        maxWidth="100%"
        className="custom-selectable"
        style={{ borderRadius: 10 }}
        actions={
          <>
            <button onClick={() => log('button')}>Inner action</button>
            <a
              href="#inside"
              onClick={(event) => {
                event.preventDefault();
                log('link');
              }}
            >
              Inner link
            </a>
            <label>
              Inner label
              <input data-testid="selectable-inner-check" type="checkbox" />
            </label>
            <select aria-label="Inner select" defaultValue="one">
              <option>one</option>
              <option>two</option>
            </select>
            <textarea aria-label="Inner textarea" defaultValue="Draft" />
            <span role="button" tabIndex={0} onClick={() => log('role')}>
              Role action
            </span>
          </>
        }
      >
        <span data-testid="selectable-content">Main body</span>
      </SelectableCard>
      <SelectableCard
        data-testid="selectable-rejected"
        label="Rejected plan"
        isSelected={rejected}
        title="Rejected"
        onChange={(value) => log(`rejected:${value}`)}
      />
      <button onClick={() => setRejected((old) => !old)}>Selectable external</button>
      <button onClick={() => setDisabled((old) => !old)}>Selectable disabled</button>
      <button onClick={() => setAlternate((old) => !old)}>Selectable appearance</button>
      <button onClick={() => log(`ref:${root.current?.dataset.testid}`)}>Selectable ref</button>
      <ConfigProvider prefixCls="custom">
        <SelectableCard
          data-testid="selectable-custom"
          label="Custom prefix plan"
          isSelected={false}
          title={0}
          description={0}
          onChange={(value) => log(`custom:${value}`)}
        />
      </ConfigProvider>
      <output data-testid="selectable-events">{events.join('|')}</output>
    </section>
  );
}
