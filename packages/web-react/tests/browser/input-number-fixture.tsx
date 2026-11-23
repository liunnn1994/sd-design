import { useRef, useState } from 'react';

import type { InputNumberInstance, InputNumberValue } from '../../src/input-number';

import { Form, FormItem } from '../../src/form';
import { InputNumber } from '../../src/input-number';

const formatWeight = (value: InputNumberValue) => `${value} kg`;
const parseWeight = (text: string) => text.replace(/ kg$/, '');

export function InputNumberFixture() {
  const [value, setValue] = useState<InputNumberValue>(2);
  const [weight, setWeight] = useState<InputNumberValue>('9007199254740992');
  const [events, setEvents] = useState<string[]>([]);
  const [mode, setMode] = useState<'embed' | 'button'>('embed');
  const [readonly, setReadonly] = useState(false);
  const [max, setMax] = useState(5);
  const [formatted, setFormatted] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [stepsHidden, setStepsHidden] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);
  const ref = useRef<InputNumberInstance>(null);
  const record = (text: string) => setEvents((old) => [...old, text]);
  return (
    <section data-testid="number-fixture">
      <Form model={{ count: value }} disabled={formDisabled}>
        <FormItem field="count" label="Count">
          <InputNumber
            ref={ref}
            value={value}
            min={0}
            max={max}
            mode={mode}
            readonly={readonly ? 'Number cannot be edited' : false}
            allowClear
            inputAttrs={{ 'aria-label': 'Model number' }}
            onValueChange={(next) => {
              setValue(next);
              record(`value:${next}`);
            }}
            onInput={(next, text) => record(`input:${next}:${text}`)}
            onChange={(next) => record(`change:${next}`)}
            onBlur={() => record('blur')}
            onClear={() => record('clear')}
          />
        </FormItem>
      </Form>
      <output data-testid="number-events">{events.join('|')}</output>
      <output data-testid="number-value">{String(value)}</output>
      <button onClick={() => setEvents([])}>Clear number events</button>
      <button onClick={() => setMode(mode === 'embed' ? 'button' : 'embed')}>
        Toggle number mode
      </button>
      <button onClick={() => setReadonly(!readonly)}>Toggle number readonly</button>
      <button onClick={() => setFormDisabled(!formDisabled)}>Toggle number form disabled</button>
      <button onClick={() => setMax(max === 5 ? 1 : 5)}>Toggle number max</button>
      <button onClick={() => setValue(3)}>Set number externally</button>
      <button onClick={() => ref.current?.focus()}>Focus number ref</button>
      <button onMouseDown={(event) => event.preventDefault()} onClick={() => ref.current?.blur()}>
        Blur number ref
      </button>
      <InputNumber
        defaultValue="9007199254740993.125"
        stringMode
        step={0.001}
        inputAttrs={{ 'aria-label': 'Exact number' }}
      />
      <InputNumber
        value={weight}
        stringMode
        formatter={formatWeight}
        parser={parseWeight}
        onValueChange={setWeight}
        onChange={(next) => record(`weight:${JSON.stringify(next)}`)}
        inputAttrs={{ 'aria-label': 'Exact weight' }}
      />
      <output data-testid="exact-weight">{JSON.stringify(weight)}</output>
      <button onClick={() => setWeight('9007199254740993')}>Set adjacent exact weight</button>
      <button onClick={() => setWeight('5.100')}>Set trailing-zero weight</button>
      <InputNumber
        defaultValue={12}
        formatter={formatted ? (val) => `$${val}` : undefined}
        parser={formatted ? (val) => val.replace('$', '') : undefined}
        inputAttrs={{ 'aria-label': 'Formatted number' }}
      />
      <button onClick={() => setFormatted(!formatted)}>Toggle number formatter</button>
      <InputNumber
        modelEvent="input"
        defaultValue={0}
        onValueChange={(next) => record(`live:${next}`)}
        inputAttrs={{ 'aria-label': 'Live number' }}
      />
      <InputNumber
        defaultValue={1}
        onKeyDown={(event) => event.preventDefault()}
        inputAttrs={{ 'aria-label': 'Prevented number' }}
      />
      <InputNumber
        defaultValue={Number.POSITIVE_INFINITY}
        precision={1}
        step={0.01}
        min={0}
        max={4}
        onChange={(next) => record(`decimal:${next}`)}
        onInput={(_, text) => record(`decimal-input:${text}`)}
        inputAttrs={{ 'aria-label': 'Decimal number' }}
      />
      <InputNumber
        min={1.24}
        max={1.26}
        precision={1}
        mode="button"
        fitWidth
        onValueChange={(next) => record(`bound:${next}`)}
        inputAttrs={{ 'aria-label': 'Tight range' }}
      />
      {mounted && (
        <InputNumber
          defaultValue={0}
          hideButton={stepsHidden}
          onChange={(next) => record(`repeat:${next}`)}
          inputAttrs={{ 'aria-label': 'Repeat number' }}
        />
      )}
      <button onClick={() => setMounted(!mounted)}>Toggle repeat number</button>
      <button onClick={() => setStepsHidden(!stepsHidden)}>Toggle repeat buttons</button>
    </section>
  );
}
