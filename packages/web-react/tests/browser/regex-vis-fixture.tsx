import { RegexVis, type RegexVisFlag } from '@sdata/web-react/regex-vis';
import { useState } from 'react';

export function RegexVisFixture() {
  const [value, setValue] = useState('/a/g');
  const [flags, setFlags] = useState<RegexVisFlag[]>(['g']);
  const [accept, setAccept] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [selections, setSelections] = useState(0);
  const [selectable, setSelectable] = useState(true);
  const [readonly, setReadonly] = useState(false);
  const [custom, setCustom] = useState(false);
  return (
    <>
      <button onClick={() => setAccept(true)}>Accept</button>
      <button onClick={() => setValue('/😀/u')}>External literal</button>
      <button onClick={() => setValue('b')}>Plain</button>
      <button onClick={() => setValue('')}>Empty</button>
      <button onClick={() => setValue('[')}>Invalid</button>
      <button onClick={() => setSelectable(!selectable)}>Selectable</button>
      <button onClick={() => setReadonly(!readonly)}>Readonly</button>
      <button onClick={() => setCustom(!custom)}>Custom</button>
      <RegexVis
        id="controlled"
        value={value}
        flags={flags}
        selectable={selectable}
        readonly={readonly}
        onValueChange={(next) => {
          setEvents((previous) => [...previous, `value:${next}`]);
          if (accept) setValue(next);
        }}
        onFlagsChange={(next) => {
          setEvents((previous) => [...previous, `flags:${next.join('')}`]);
          if (accept) setFlags(next);
        }}
        onSelect={() => setSelections((count) => count + 1)}
        renderEmpty={
          custom ? ({ text }) => <span data-testid="custom-empty">Empty: {text}</span> : undefined
        }
        renderError={
          custom
            ? ({ error }) => <span data-testid="custom-error">Error: {error.message}</span>
            : undefined
        }
        renderFooter={({ value: current, flags: currentFlags }) => (
          <output data-testid="footer">
            {current}|{currentFlags.join('')}
          </output>
        )}
      />
      <RegexVis id="uncontrolled" defaultValue="a+?" />
      <output data-testid="state">
        {value}|{flags.join('')}
      </output>
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="selected">{selections}</output>
    </>
  );
}

export function RegexVisPatternFixture() {
  const params = new URLSearchParams(location.search);
  const [selection, setSelection] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [flagEvents, setFlagEvents] = useState<string[]>([]);
  return (
    <div sd-theme={params.has('dark') ? 'dark' : undefined}>
      <RegexVis
        defaultValue={params.get('pattern') ?? ''}
        defaultFlags={params.has('unicode') ? ['u'] : []}
        onSelect={({ node }) => setSelection(JSON.stringify(node))}
        onError={(error) => setErrors((previous) => [...previous, error ? 'invalid' : 'valid'])}
        onFlagsChange={(flags) => setFlagEvents((previous) => [...previous, flags.join('')])}
      />
      <output data-testid="node">{selection}</output>
      <output data-testid="errors">{errors.join('|')}</output>
      <output data-testid="flag-events">{flagEvents.join('|')}</output>
    </div>
  );
}
