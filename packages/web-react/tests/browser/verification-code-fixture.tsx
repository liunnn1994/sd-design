import { useRef, useState } from 'react';

import { Form, FormItem } from '../../src/form/index.js';
import {
  VerificationCode,
  type VerificationCodeInstance,
} from '../../src/verification-code/index.js';

export function VerificationCodeFixture() {
  const [value, setValue] = useState('');
  const [length, setLength] = useState(4);
  const [disabled, setDisabled] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const ref = useRef<VerificationCodeInstance>(null);
  const record = (event: string) => setEvents((old) => [...old, event]);
  return (
    <section data-testid="verification-fixture">
      <VerificationCode
        data-testid="verification"
        value={value}
        length={length}
        ref={ref}
        disabled={disabled}
        onValueChange={(next) => {
          record(`update:${next}`);
          setValue(next);
        }}
        onInput={(next, index) => record(`input:${index}:${next}`)}
        onChange={(next) => record(`change:${next}`)}
        onFinish={(next) => record(`finish:${next}`)}
        formatter={(next) => (/\d/.test(next) ? next : false)}
        separator={(index) =>
          index === 1 ? <span data-testid="verification-separator">-</span> : null
        }
      />
      <VerificationCode
        data-testid="verification-locked"
        value="12"
        length={4}
        onValueChange={(next) => record(`locked:${next}`)}
      />
      <VerificationCode data-testid="verification-default" defaultValue="12" length={length} />
      <VerificationCode
        data-testid="verification-readonly"
        defaultValue="12"
        length={4}
        readonly="Read only code"
        masked
        onValueChange={(next) => record(`readonly:${next}`)}
      />
      <Form model={{}} disabled>
        <FormItem>
          <VerificationCode data-testid="verification-form-disabled" />
        </FormItem>
      </Form>
      <button onClick={() => ref.current?.focus()}>Focus code</button>
      <button onClick={() => ref.current?.blur()} onMouseDown={(event) => event.preventDefault()}>
        Blur code
      </button>
      <button onClick={() => setValue('90')}>Set code</button>
      <button onClick={() => setLength(length === 4 ? 6 : 4)}>Resize code</button>
      <button onClick={() => setLength(0)}>Remove code cells</button>
      <button onClick={() => setDisabled(!disabled)}>Disable code</button>
      <output data-testid="verification-value">{value}</output>
      <output data-testid="verification-events">{events.join('|')}</output>
    </section>
  );
}
