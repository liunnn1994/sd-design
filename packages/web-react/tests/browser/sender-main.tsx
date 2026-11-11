import enUS from '@sdata/web-core/locale/lang/en-us';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { SenderRef, SenderSlotConfig } from '../../src/sender/index.js';

import { ConfigProvider } from '../../src/config-provider/index.js';
import { Sender, SenderHeader, SenderSwitch, RecorderCore } from '../../src/sender/index.js';
import '../../styles/sender.scss';

const params = new URLSearchParams(location.search);
const metrics = {
  changes: [] as string[],
  submits: [] as string[],
  cancels: 0,
  errors: [] as string[],
  stops: 0,
  opens: 0,
  closes: 0,
  pastes: 0,
  files: 0,
};
if (params.has('speech')) {
  RecorderCore.Support = () => true;
  RecorderCore.prototype.open = function (success: () => void) {
    metrics.opens++;
    success();
  };
  RecorderCore.prototype.start = function () {};
  RecorderCore.prototype.close = function () {
    metrics.closes++;
  };
  RecorderCore.prototype.stop = function (success: (blob: Blob, duration: number) => void) {
    success(new Blob(['audio'], { type: 'audio/wav' }), 120);
  };
}
const initialConfig: SenderSlotConfig[] = [
  { type: 'text', value: 'Hello ' },
  {
    type: 'input',
    key: 'name',
    props: { defaultValue: 'Ada', placeholder: 'Name' },
    formatResult: (value) => `[${value}]`,
  },
  {
    type: 'custom',
    key: 'custom',
    props: { defaultValue: 'Custom' },
    customRender: (value, change, state) => (
      <>
        <input
          aria-label="Custom"
          value={String(value)}
          disabled={state.disabled}
          readOnly={state.readonly}
          onChange={(event) => change(event.target.value)}
        />
        <button onClick={state.remove}>Remove custom</button>
      </>
    ),
  },
];
function App() {
  const sender = useRef<SenderRef>(null);
  const [value, setValue] = useState('Initial');
  const [disabled, setDisabled] = useState(false),
    [readonly, setReadonly] = useState(false),
    [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false),
    [mounted, setMounted] = useState(true),
    [speech, setSpeech] = useState(params.has('speech'));
  const [config, setConfig] = useState(initialConfig),
    [checked, setChecked] = useState(false);
  const [snapshot, setSnapshot] = useState('');
  Object.assign(window, { senderMetrics: metrics, readSender: () => sender.current });
  return (
    <ConfigProvider locale={enUS}>
      <button onClick={() => setDisabled(!disabled)}>Toggle disabled</button>
      <button onClick={() => setReadonly(!readonly)}>Toggle readonly</button>
      <button onClick={() => setLoading(!loading)}>Toggle loading</button>
      <button onClick={() => sender.current?.clear()}>Clear</button>
      <button onClick={() => sender.current?.insert('Added', 'end')}>Insert</button>
      <button
        onClick={() =>
          sender.current?.insert(
            [{ type: 'tag', key: 'runtime', props: { label: 'Runtime' } }],
            'end',
          )
        }
      >
        Insert slot
      </button>
      <button onClick={() => setSnapshot(JSON.stringify(sender.current?.getValue()))}>Read</button>
      <output data-testid="snapshot">{snapshot}</output>
      <button
        onClick={() => setConfig([...config, { type: 'tag', key: 'new', props: { label: 'New' } }])}
      >
        Extend config
      </button>
      <button onClick={() => setOpen(!open)}>Toggle header</button>
      <button onClick={() => setMounted(!mounted)}>Toggle sender</button>
      <button onClick={() => setSpeech(!speech)}>Toggle speech</button>
      {mounted && (
        <Sender
          ref={sender}
          defaultValue="Initial"
          {...(params.has('controlled')
            ? { value, onValueChange: setValue }
            : params.has('frozen')
              ? { value: undefined }
              : {})}
          disabled={disabled}
          readonly={readonly ? 'Read only' : false}
          loading={loading}
          allowSpeech={speech}
          placeholder="Message"
          onKeyDown={() => (params.has('intercept') ? false : undefined)}
          onPaste={() => metrics.pastes++}
          onPasteFile={(files) => {
            metrics.files += files.length;
          }}
          submitType={params.has('shift') ? 'shiftEnter' : 'enter'}
          {...(params.has('slots')
            ? { slotConfig: config, skill: { value: 'search', title: 'Search', closable: true } }
            : {})}
          onChange={(value) => metrics.changes.push(value)}
          onSubmit={(value) => metrics.submits.push(value)}
          onCancel={() => metrics.cancels++}
          onSpeechEnd={() => metrics.stops++}
          onSpeechError={(message) => metrics.errors.push(message)}
          slots={{
            header: () => (
              <SenderHeader
                open={open}
                forceRender={params.has('force')}
                title="Attachments"
                onOpenChange={setOpen}
              >
                <p>Header content</p>
              </SenderHeader>
            ),
            footer: ({ actions }) => (
              <button disabled={actions.clearDisabled} onClick={actions.clear}>
                Footer clear
              </button>
            ),
          }}
        />
      )}
      <SenderSwitch value={checked} onValueChange={setChecked}>
        {({ checked }) => (checked ? 'Enabled' : 'Disabled')}
      </SenderSwitch>
      <SenderSwitch defaultValue disabled={disabled}>
        Uncontrolled
      </SenderSwitch>
    </ConfigProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
