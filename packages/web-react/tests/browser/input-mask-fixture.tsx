import { useRef, useState } from 'react';

import { InputMask, type InputMaskInstance, type InputMaskPresetName } from '../../src/input-mask';

export function InputMaskFixture() {
  const testPreset = new URLSearchParams(location.search).get(
    'preset',
  ) as InputMaskPresetName | null;
  const [value, setValue] = useState<string | undefined>('12');
  const [mask, setMask] = useState<string | undefined>('99-99');
  const [preset, setPreset] = useState<InputMaskPresetName | undefined>('date');
  const [mounted, setMounted] = useState(true);
  const [inputState, setInputState] = useState<'ready' | 'disabled' | 'readonly' | 'error'>(
    'ready',
  );
  const [events, setEvents] = useState<string[]>([]);
  const input = useRef<InputMaskInstance>(null);
  const record = (text: string) => setEvents((old) => [...old, text]);
  return (
    <section data-testid="mask-fixture">
      {mounted && (
        <InputMask
          data-testid="mask-main"
          ref={input}
          value={value}
          onValueChange={(next) => {
            setValue(next);
            record(`update:${next}`);
          }}
          mask={mask}
          allowClear
          maxLength={2}
          showWordLimit
          onComplete={(next) => record(`complete:${next}`)}
          onInput={(next) => record(`input:${next}`)}
          onChange={(next) => record(`change:${next}`)}
        />
      )}
      <InputMask
        data-testid="mask-preset"
        preset={testPreset ?? preset}
        onValueChange={testPreset ? (next) => record(`preset-update:${next}`) : undefined}
      />
      <InputMask
        data-testid="mask-ipv4"
        preset="ipv4"
        disabled={inputState === 'disabled'}
        readonly={inputState === 'readonly'}
        error={inputState === 'error'}
      />
      <select
        aria-label="Mask input state"
        value={inputState}
        onChange={(event) => setInputState(event.target.value as typeof inputState)}
      >
        <option value="ready">Ready</option>
        <option value="disabled">Disabled</option>
        <option value="readonly">Readonly</option>
        <option value="error">Error</option>
      </select>
      <InputMask
        data-testid="mask-date"
        mask="9999-99-99"
        onComplete={(next) => record(`date-complete:${next}`)}
      />
      <InputMask data-testid="mask-array" mask={['+86 ', /\d/, /\d/]} maskChar={null} />
      <InputMask
        data-testid="mask-reject"
        mask="99"
        beforeMaskedValueChange={(next, previous) => (next.value === '12' ? previous : next)}
        onValueChange={(next) => record(`reject-update:${next}`)}
        onComplete={(next) => record(`reject-complete:${next}`)}
      />
      <InputMask
        data-testid="mask-supply"
        mask="99"
        beforeMaskedValueChange={(next) => ({
          ...next,
          value: '12',
          selection: { start: 2, end: 2 },
        })}
        onValueChange={(next) => record(`supplied-update:${next}`)}
        onComplete={(next) => record(`supplied-complete:${next}`)}
      />
      <InputMask
        data-testid="mask-initial"
        mask="99"
        defaultValue="12"
        onComplete={(next) => record(`initial:${next}`)}
      />
      <InputMask data-testid="mask-placeholder" mask="99" maskChar="😀" alwaysShowMask />
      <InputMask
        data-testid="mask-native"
        preset="date"
        inputAttrs={{ 'inputMode': 'tel', 'aria-label': 'Custom mask' }}
      />
      <button onClick={() => setValue(undefined)}>Reset mask</button>
      <button onClick={() => setValue('9876')}>Set raw mask</button>
      <button onClick={() => setMask(mask ? undefined : '99-99')}>Toggle mask</button>
      <button onClick={() => setPreset(preset === 'date' ? 'email' : undefined)}>
        Change mask preset
      </button>
      <button onClick={() => input.current?.focus()}>Focus mask</button>
      <button onMouseDown={(event) => event.preventDefault()} onClick={() => input.current?.blur()}>
        Blur mask
      </button>
      <button onClick={() => setMounted(!mounted)}>Toggle mask mount</button>
      <output data-testid="mask-value">{value}</output>
      <output data-testid="mask-events">{events.join('|')}</output>
    </section>
  );
}
