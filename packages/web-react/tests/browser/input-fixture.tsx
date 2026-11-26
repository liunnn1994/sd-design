import { useRef, useState } from 'react';

import type { InputInstance } from '../../src/input';

import { Button } from '../../src/button';
import { ConfigProvider } from '../../src/config-provider';
import { Form, FormItem } from '../../src/form';
import { Input, InputGroup, InputPassword, InputSearch } from '../../src/input';
import { Select } from '../../src/select';

export function InputFixture() {
  const [value, setValue] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [outer, setOuter] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [visibility, setVisibility] = useState(true);
  const [searches, setSearches] = useState('');
  const [eventTarget, setEventTarget] = useState('');
  const [passwordRequests, setPasswordRequests] = useState(0);
  const ref = useRef<InputInstance>(null);
  const record = (event: string) => setEvents((old) => [...old, event]);
  return (
    <section data-testid="input-fixture">
      <InputGroup data-testid="mixed-input-group">
        <Button>First</Button>
        <Select options={['Option']} />
        <Button shape="round">Middle</Button>
        <Input />
        <Button>Last</Button>
      </InputGroup>
      <Form model={{ name: value }}>
        <FormItem
          field="name"
          label="Input name"
          validateTrigger="input"
          rules={{ required: true, message: 'Input required' }}
        >
          <Input
            ref={ref}
            value={value}
            onValueChange={(next) => {
              record(`value:${next}`);
              setValue(next);
            }}
            onInput={(next) => record(`input:${next}`)}
            onChange={(next) => record(`change:${next}`)}
            onPressEnter={() => record('enter')}
            onClear={() => record('clear')}
            allowClear
            inputAttrs={{ 'aria-label': 'Model input' }}
            prepend={outer ? 'https://' : undefined}
            suffix={outer ? 'suffix' : undefined}
          />
        </FormItem>
      </Form>
      <Input value="fixed" inputAttrs={{ 'aria-label': 'Locked input' }} />
      <Input maxLength={2} showWordLimit inputAttrs={{ 'aria-label': 'Limited input' }} />
      <Input
        maxLength={{ length: 2, errorOnly: true }}
        showWordLimit
        inputAttrs={{ 'aria-label': 'Error limit input' }}
      />
      <Input
        defaultValue="secret"
        readonly="Cannot edit this value"
        allowClear
        inputAttrs={{ 'aria-label': 'Readonly input' }}
      />
      <Input fitWidth defaultValue="x" inputAttrs={{ 'aria-label': 'Fit input' }} />
      <ConfigProvider allowClear>
        <Input defaultValue="global" inputAttrs={{ 'aria-label': 'Global clear input' }} />
        <Input
          allowClear={false}
          defaultValue="local"
          inputAttrs={{ 'aria-label': 'No clear input' }}
        />
      </ConfigProvider>
      <InputPassword
        visibility={visibility}
        onVisibilityUpdate={setVisibility}
        defaultValue="password"
        inputAttrs={{ 'aria-label': 'Password input' }}
      />
      <InputSearch
        defaultValue="query"
        searchButton
        buttonText="Run search"
        disabled={disabled}
        buttonProps={{ disabled: false, loading: false }}
        onSearch={setSearches}
        inputAttrs={{ 'aria-label': 'Search input' }}
      />
      <Input
        prepend={0}
        append={0}
        prefix={0}
        suffix={0}
        inputAttrs={{ 'aria-label': 'Numeric affix input' }}
        onKeyUp={(event) => setEventTarget(event.currentTarget.tagName)}
      />
      <InputGroup data-testid="native-inputs" className="grouped-inputs">
        <Input
          data-testid="weighted-input"
          maxLength={4}
          showWordLimit
          wordLength={(text) => [...text].length * 2}
          inputAttrs={{ 'aria-label': 'Weighted input', 'name': 'weighted' }}
        />
        <Input
          maxLength={4}
          wordSlice={(text, length) => text.slice(0, length).toUpperCase()}
          inputAttrs={{ 'aria-label': 'Custom slice input' }}
        />
        <Input
          defaultValue="Disabled"
          disabled
          allowClear
          inputAttrs={{ 'aria-label': 'Disabled input' }}
        />
      </InputGroup>
      <InputPassword
        visibility
        defaultValue="masked"
        onVisibilityUpdate={() => setPasswordRequests((count) => count + 1)}
        inputAttrs={{ 'aria-label': 'Locked password' }}
      />
      <InputPassword defaultVisibility={false} inputAttrs={{ 'aria-label': 'Plain password' }} />
      <output data-testid="password-requests">{passwordRequests}</output>
      <output data-testid="input-event-target">{eventTarget}</output>
      <button onClick={() => setOuter(!outer)}>Toggle input outer</button>
      <button onClick={() => setDisabled(!disabled)}>Disable input search</button>
      <button onClick={() => ref.current?.focus()}>Focus input ref</button>
      <button onClick={() => setEvents([])}>Clear input events</button>
      <output data-testid="input-events">{events.join('|')}</output>
      <output data-testid="input-model">{value}</output>
      <output data-testid="input-searches">{searches}</output>
    </section>
  );
}
