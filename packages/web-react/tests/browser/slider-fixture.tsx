import { useState } from 'react';

import { Slider, Form, FormItem, type SliderValue } from '../../src/index';

export function SliderFixture() {
  const [value, setValue] = useState<SliderValue>(20);
  const [range, setRange] = useState<SliderValue>([20, 60]);
  const [disabled, setDisabled] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const record = (text: string) => setEvents((old) => [...old, text]);
  return (
    <section data-testid="slider-fixture" style={{ width: 440 }}>
      <Form model={{ amount: value }}>
        <FormItem
          field="amount"
          rules={{ type: 'number', min: 10, message: 'Amount too low' }}
          validateTrigger="change"
        >
          {mounted && (
            <Slider
              value={value}
              onValueChange={setValue}
              onChange={(next) => record(`single:${next}`)}
              disabled={disabled}
              step={10}
              max={95}
              showTicks
              marks={{ 0: 'Low', 50: 'Middle', 95: 'High' }}
              formatTooltip={(next) => `${next} percent`}
              data-testid="single-slider"
            />
          )}
        </FormItem>
      </Form>
      <output data-testid="slider-value">{String(value)}</output>
      <button onClick={() => setDisabled(!disabled)}>Toggle slider disabled</button>
      <button onClick={() => setMounted(!mounted)}>Toggle slider mount</button>
      <button onClick={() => setEvents([])}>Clear slider events</button>
      <Slider
        value={range}
        onValueChange={setRange}
        range
        showInput
        step={10}
        data-testid="range-slider"
      />
      <output data-testid="slider-range">{JSON.stringify(range)}</output>
      <Slider
        value={20}
        step={10}
        onChange={(next) => record(`locked:${next}`)}
        data-testid="locked-slider"
      />
      <Slider defaultValue={[0, 0.3]} range step={0.2} max={1} data-testid="decimal-slider" />
      <Slider
        defaultValue={-20}
        min={-50}
        max={50}
        step={10}
        direction="vertical"
        style={{ height: 200 }}
        data-testid="vertical-slider"
      />
      <Slider defaultValue={30} showTooltip={false} data-testid="silent-slider" />
      <output data-testid="slider-events">{events.join('|')}</output>
    </section>
  );
}
