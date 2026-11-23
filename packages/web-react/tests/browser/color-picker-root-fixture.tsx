import { ConfigProvider } from '@sdata/web-react';
import { ColorPicker } from '@sdata/web-react/color-picker';
import { useState } from 'react';

export function ColorPickerRootFixture() {
  const params = new URLSearchParams(location.search);
  const [value, setValue] = useState('#ff0000');
  const [accept, setAccept] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [custom, setCustom] = useState(false);
  const [popup, setPopup] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [swatches, setSwatches] = useState<string[] | null>();
  const [recent, setRecent] = useState(['#165DFF', '#00B42A']);
  return (
    <ConfigProvider
      colorPicker={params.has('no-provider-swatches') ? undefined : { swatchColors: ['#0000ff'] }}
    >
      <button onClick={() => setAccept(!accept)}>Accept</button>
      <button onClick={() => setReadonly(!readonly)}>Readonly</button>
      <button onClick={() => setDisabled(!disabled)}>Disabled</button>
      <button onClick={() => setCustom(!custom)}>Custom trigger</button>
      <button onClick={() => setPopup(!popup)}>External popup</button>
      <button onClick={() => setValue('#00ff00')}>External green</button>
      {params.has('swatches') && (
        <>
          <button onClick={() => setSwatches(['#abcdef'])}>Override swatches</button>
          <button onClick={() => setSwatches(null)}>Hide swatches</button>
          <button onClick={() => setSwatches(undefined)}>Inherit swatches</button>
        </>
      )}
      <ColorPicker
        id="picker"
        defaultValue="#ff0000"
        value={params.has('controlled') ? value : undefined}
        format="HEX"
        colorModes={['monochrome', 'linear-gradient']}
        swatchColors={swatches}
        recentColors={params.has('recent') ? recent : undefined}
        defaultRecentColors={params.has('seeded') ? ['#165DFF'] : undefined}
        clearable
        disabled={disabled}
        readonly={readonly ? 'Locked color' : false}
        hideTrigger={params.has('hidden')}
        triggerProps={
          params.has('popup')
            ? { popupVisible: popup }
            : { defaultPopupVisible: params.has('open') }
        }
        renderTrigger={
          custom
            ? (state) => (
                <button data-testid="custom-trigger">
                  {state.displayValue}|{String(state.popupVisible)}
                </button>
              )
            : undefined
        }
        onValueChange={(next) => {
          setEvents((previous) => [...previous, `value:${next}`]);
          if (accept) setValue(next);
        }}
        onChange={(next, context) =>
          setEvents((previous) => [...previous, `change:${next}:${context.trigger}`])
        }
        onClear={() => setEvents((previous) => [...previous, 'clear'])}
        onRecentColorsChange={(colors) => {
          setEvents((previous) => [...previous, `recent:${colors.join(',')}`]);
          if (accept) setRecent(colors);
        }}
        onPopupVisibleChange={(next, display) => {
          setEvents((previous) => [...previous, `popup:${next}:${display}`]);
          if (accept) setPopup(next);
        }}
      />
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="value">{value}</output>
    </ConfigProvider>
  );
}
