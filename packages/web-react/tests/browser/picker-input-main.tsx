import { dayjs } from '@sdata/web-core/_utils/date';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { PickerInput, type PickerInputInstance } from '../../src/_shared/picker-input.js';
import '../../styles/time-picker.scss';
import '@sdata/web-core/styles/_components/picker/style/index.scss';

function Fixture() {
  const range = new URLSearchParams(location.search).has('range');
  const [draft, setDraft] = useState<string | Array<string | undefined>>();
  const [index, setIndex] = useState(0);
  const [readonly, setReadonly] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [clears, setClears] = useState(0);
  const [fit, setFit] = useState(false);
  const [removed, setRemoved] = useState(false);
  const ref = useRef<PickerInputInstance>(null);
  const value = dayjs('09:15:30', 'HH:mm:ss');
  return (
    <div>
      <button onClick={() => setReadonly(!readonly)}>Readonly</button>
      <button onClick={() => setDisabled(!disabled)}>Disabled</button>
      <button onClick={() => setFit(!fit)}>Fit width</button>
      <button onClick={() => ref.current?.focus(range ? 1 : undefined)}>Focus input</button>
      <button onClick={() => ref.current?.blur()}>Blur input</button>
      <button onClick={() => setRemoved(!removed)}>Mount input</button>
      {!removed && (
        <PickerInput
          ref={ref}
          range={range}
          format="HH:mm:ss"
          value={range ? [value, value.add(2, 'hour')] : value}
          inputValue={draft}
          focusedIndex={index}
          onFocusedIndexChange={setIndex}
          readonly={readonly ? 'Locked picker' : false}
          disabled={range ? [false, disabled] : disabled}
          allowClear={!readonly}
          fitWidth={fit}
          prefix={<span>Time</span>}
          suffixIcon={<span>Clock</span>}
          inputProps={
            range
              ? [{ 'aria-label': 'Start' }, { 'aria-label': 'End' }]
              : { 'aria-label': 'Time input', 'title': 'Native title' }
          }
          onChange={(event) => {
            const text = (event.target as HTMLInputElement).value;
            setDraft(
              range
                ? Object.assign([...(Array.isArray(draft) ? draft : [])], { [index]: text })
                : text,
            );
          }}
          onClear={() => setClears((count) => count + 1)}
          rootProps={{ id: 'picker-input' }}
        />
      )}
      <output data-testid="index">{index}</output>
      <output data-testid="clears">{clears}</output>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
