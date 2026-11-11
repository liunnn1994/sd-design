import { useState } from 'react';

import {
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Form,
  FormItem,
  type CheckboxValue,
  type CheckboxModelValue,
  type RadioValue,
} from '../../src/index';

export function ChoiceFixture() {
  const [checks, setChecks] = useState<CheckboxValue[]>([0]);
  const [single, setSingle] = useState<CheckboxModelValue>(false);
  const [mixed, setMixed] = useState(true);
  const [max, setMax] = useState(2);
  const [disabled, setDisabled] = useState(false);
  const [radio, setRadio] = useState<RadioValue>(0);
  const [button, setButton] = useState(false);
  const [options, setOptions] = useState([0, 1, 2]);
  const [events, setEvents] = useState<string[]>([]);
  const record = (text: string) => setEvents((old) => [...old, text]);
  return (
    <section data-testid="choice-fixture">
      <Checkbox
        modelValue={single}
        onValueChange={setSingle}
        indeterminate={mixed}
        inputAttrs={{ 'aria-label': 'Mixed check' }}
      >
        Mixed
      </Checkbox>
      <button onClick={() => setMixed(!mixed)}>Toggle mixed state</button>
      <Checkbox modelValue={false} inputAttrs={{ 'aria-label': 'Locked check' }}>
        Locked
      </Checkbox>
      <Checkbox modelValue={[false]} value={false} inputAttrs={{ 'aria-label': 'False check' }}>
        False
      </Checkbox>
      <CheckboxGroup
        value={checks}
        onValueChange={setChecks}
        onChange={(next) => record(`checks:${next.join(',')}`)}
        max={max}
        disabled={disabled}
        options={[0, 1, { value: 2, disabled: true }, 3]}
        data-testid="checks"
      />
      <output data-testid="check-values">{checks.join(',')}</output>
      <button onClick={() => setMax(max === 2 ? 1 : 2)}>Toggle selection limit</button>
      <button onClick={() => setDisabled(!disabled)}>Toggle choice disabled</button>
      <CheckboxGroup value={[]} disabled>
        <Checkbox
          value="ignored"
          defaultChecked
          uninjectGroupContext
          inputAttrs={{ 'aria-label': 'Independent check' }}
        >
          Independent
        </Checkbox>
      </CheckboxGroup>
      <RadioGroup
        value={radio}
        onValueChange={setRadio}
        options={options}
        type={button ? 'button' : 'radio'}
        disabled={disabled}
        data-testid="radios"
      />
      <output data-testid="radio-value">{String(radio)}</output>
      <button onClick={() => setButton(!button)}>Toggle radio type</button>
      <button onClick={() => setOptions(options.length === 3 ? [2, 0] : [0, 1, 2])}>
        Replace radio options
      </button>
      <RadioGroup
        value="a"
        options={['a', 'b']}
        onValueChange={(next) => record(`locked:${next}`)}
        data-testid="locked-radios"
      />
      <RadioGroup defaultValue={false} data-testid="boolean-radios">
        <Radio value={false}>False</Radio>
        <Radio value={true}>True</Radio>
      </RadioGroup>
      <CheckboxGroup
        defaultValue={[0]}
        options={[0]}
        renderLabel={(option) => `Custom ${option.value}`}
        renderCheckbox={({ checked }) => <b data-testid="custom-check">{String(checked)}</b>}
      />
      <RadioGroup
        defaultValue={0}
        options={[0]}
        renderRadio={({ checked }) => <b data-testid="custom-radio">{String(checked)}</b>}
      />
      <Form model={{ accepted: single }}>
        <FormItem
          field="accepted"
          rules={{
            type: 'boolean',
            validator: (value, done) => done(value ? undefined : 'Accept required'),
          }}
          validateTrigger="change"
        >
          <Checkbox
            modelValue={single}
            onValueChange={setSingle}
            inputAttrs={{ 'aria-label': 'Form check' }}
          >
            Accept
          </Checkbox>
        </FormItem>
      </Form>
      <output data-testid="choice-events">{events.join('|')}</output>
    </section>
  );
}
