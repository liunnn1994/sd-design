import { useState } from 'react';

import { ConfigProvider } from '../../src/config-provider/index.js';
import { Form, FormItem } from '../../src/form/index.js';
import { Rate } from '../../src/rate/index.js';

export function RateFixture() {
  const [value, setValue] = useState(2);
  const [disabled, setDisabled] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [half, setHalf] = useState(true);
  const [grading, setGrading] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const record = (text: string) => setEvents((old) => [...old, text]);
  return (
    <section data-testid="rate-fixture">
      <ConfigProvider allowClear>
        <Form model={{ score: value }}>
          <FormItem
            field="score"
            rules={{ type: 'number', min: 1, message: 'Score required' }}
            validateTrigger="change"
          >
            <Rate
              value={value}
              onValueChange={(next) => {
                setValue(next);
                record(`value:${next}`);
              }}
              onChange={(next) => record(`change:${next}`)}
              onHoverChange={(next) => record(`hover:${next}`)}
              allowHalf={half}
              disabled={disabled}
              readonly={readonly ? 'Rating is locked' : false}
              color={{ 2: 'rgb(255, 0, 0)', 5: 'rgb(0, 0, 255)' }}
              aria-label="Model rating"
            />
          </FormItem>
        </Form>
      </ConfigProvider>
      <output data-testid="rate-value">{value}</output>
      <output data-testid="rate-events">{events.join('|')}</output>
      <button onClick={() => setEvents([])}>Clear rate events</button>
      <button onClick={() => setDisabled(!disabled)}>Toggle rate disabled</button>
      <button onClick={() => setReadonly(!readonly)}>Toggle rate readonly</button>
      <button onClick={() => setHalf(!half)}>Toggle rate half</button>
      <button onClick={() => setValue(4)}>Set rate externally</button>
      <Rate value={2} aria-label="Locked rating" />
      <Rate
        count={3}
        defaultValue={1}
        renderCharacter={(index) => <b data-testid="rate-custom">{index}</b>}
        aria-label="Custom rating"
      />
      <Rate grading={grading} value={value} count={3} aria-label="Grading rating" />
      <button onClick={() => setGrading(!grading)}>Toggle rate grading</button>
      <ConfigProvider allowClear>
        <Rate defaultValue={2} allowClear={false} aria-label="No clear rating" />
      </ConfigProvider>
    </section>
  );
}
