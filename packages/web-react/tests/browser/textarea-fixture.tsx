import { useRef, useState } from 'react';

import type { TextareaInstance } from '../../src/index';

import { Textarea, Form, FormItem } from '../../src/index';

export function TextareaFixture() {
  const [value, setValue] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [auto, setAuto] = useState(true);
  const [min, setMin] = useState(2);
  const [max, setMax] = useState(5);
  const [width, setWidth] = useState(360);
  const [visible, setVisible] = useState(true);
  const ref = useRef<TextareaInstance>(null);
  const record = (name: string) => setEvents((old) => [...old, name]);
  return (
    <section data-testid="textarea-fixture">
      <Form model={{ notes: value }}>
        <FormItem
          field="notes"
          label="Notes"
          validateTrigger="input"
          rules={{ required: true, message: 'Notes required' }}
        >
          <Textarea
            ref={ref}
            value={value}
            onValueChange={(next) => {
              setValue(next);
              record(`value:${next}`);
            }}
            onInput={(next) => record(`input:${next}`)}
            onBlur={() => record('blur')}
            onChange={(next) => record(`change:${next}`)}
            onClear={() => record('clear')}
            allowClear
            maxLength={6}
            showWordLimit
            textareaAttrs={{ 'aria-label': 'Model textarea' }}
          />
        </FormItem>
      </Form>
      <Textarea value="fixed" textareaAttrs={{ 'aria-label': 'Locked textarea' }} />
      <Textarea maxLength={2} showWordLimit textareaAttrs={{ 'aria-label': 'Limited textarea' }} />
      <Textarea
        defaultValue="secret"
        readonly="Textarea cannot be edited"
        textareaAttrs={{ 'aria-label': 'Readonly textarea' }}
      />
      <Textarea
        fitWidth
        defaultValue="x"
        suffix={0}
        textareaAttrs={{ 'aria-label': 'Fit textarea' }}
      />
      <div style={{ width }}>
        {visible && (
          <Textarea
            autoSize={auto ? { minRows: min, maxRows: max } : false}
            defaultValue={'One\nTwo\nThree\nFour\nFive'}
            textareaAttrs={{ 'aria-label': 'Auto textarea' }}
          />
        )}
      </div>
      <button onClick={() => setMax(max === 5 ? 2 : 5)}>Toggle textarea maximum</button>
      <button onClick={() => setMin(min === 2 ? 4 : 2)}>Toggle textarea minimum</button>
      <button onClick={() => setAuto(!auto)}>Toggle textarea auto size</button>
      <button onClick={() => setWidth(width === 360 ? 120 : 360)}>Resize textarea parent</button>
      <button onClick={() => setVisible(!visible)}>Toggle textarea mount</button>
      <button onClick={() => ref.current?.focus()}>Focus textarea ref</button>
      <button onClick={() => setEvents([])}>Clear textarea events</button>
      <output data-testid="textarea-events">{events.join('|')}</output>
      <output data-testid="textarea-value">{value}</output>
    </section>
  );
}
