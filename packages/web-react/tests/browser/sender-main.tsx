import enUS from '@sdata/web-core/locale/lang/en-us';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import type { SenderRef, SenderSlotConfig } from '../../src/sender/index.js';

import { ConfigProvider } from '../../src/config-provider/index.js';
import { Sender, SenderHeader, SenderSwitch, RecorderCore } from '../../src/sender/index.js';
import '../../styles/sender.scss';

const params = new URLSearchParams(location.search);
const sourceStream = (window as Window & { senderTestStream?: MediaStream }).senderTestStream;
const metrics = {
  changes: [] as string[],
  submits: [] as string[],
  submittedSlots: [] as { types: SenderSlotConfig['type'][]; skill: string | undefined }[],
  cancels: 0,
  errors: [] as { message: string; isUserNotAllow: boolean }[],
  stops: 0,
  opens: 0,
  closes: 0,
  pastes: 0,
  files: 0,
};
if (params.get('speech') === '') {
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
const allSlots: SenderSlotConfig[] = [
  { type: 'text', value: 'Find ' },
  { type: 'select', key: 'city', props: { options: ['London', 'Paris'], defaultValue: 'Paris' } },
  { type: 'text', value: ' ' },
  { type: 'input', key: 'query', props: { defaultValue: 'weather' } },
  {
    type: 'content',
    key: 'when',
    props: { defaultValue: 'today' },
    formatResult: (value) => ` [${value}]`,
  },
  { type: 'tag', key: 'detail', props: { label: 'Detail', value: ' details' } },
];
const searchSkill = { value: 'search', title: 'Search', closable: true };
const textSlot: SenderSlotConfig[] = [{ type: 'text', value: 'Keep this content' }];
function App() {
  const sender = useRef<SenderRef>(null);
  const [value, setValue] = useState('Initial');
  const [disabled, setDisabled] = useState(false),
    [readonly, setReadonly] = useState(false),
    [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false),
    [mounted, setMounted] = useState(true),
    [speech, setSpeech] = useState(params.has('speech'));
  const [config, setConfig] = useState(params.has('all-slots') ? allSlots : initialConfig),
    [checked, setChecked] = useState(false);
  const [mode, setMode] = useState(
    params.has('controlled') ? 'write' : params.has('frozen') ? 'deny' : 'local',
  );
  const [showActions, setShowActions] = useState(true);
  const [lineHeight, setLineHeight] = useState(20);
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
      <button onClick={() => setValue('External text')}>Write external text</button>
      <button onClick={() => setMode('local')}>Release control</button>
      <button onClick={() => setShowActions(!showActions)}>Toggle actions</button>
      {params.has('resize') && (
        <button onClick={() => setLineHeight(30)}>Increase line height</button>
      )}
      {mounted && (
        <Sender
          ref={sender}
          defaultValue="Initial"
          {...(mode === 'write'
            ? { value, onValueChange: setValue }
            : mode === 'deny'
              ? { value: undefined }
              : {})}
          disabled={disabled}
          readonly={readonly ? 'Read only' : false}
          loading={loading}
          allowSpeech={speech && (sourceStream ? { type: 'pcm', sourceStream } : true)}
          voiceGlow={params.has('custom-glow') ? { type: 'pill', strength: 0.6 } : true}
          showActions={showActions}
          placeholder="Message"
          {...(params.has('resize')
            ? {
                autoSize: { minRows: 2, maxRows: 4 },
                styles: { input: { lineHeight: `${lineHeight}px` } },
              }
            : {})}
          onKeyDown={() => (params.has('intercept') ? false : undefined)}
          onPaste={() => metrics.pastes++}
          onPasteFile={(files) => {
            metrics.files += files.length;
          }}
          submitType={params.has('shift') ? 'shiftEnter' : 'enter'}
          {...(params.has('slots') || params.has('all-slots')
            ? { slotConfig: config, skill: searchSkill }
            : params.has('text-slot')
              ? { slotConfig: textSlot }
              : {})}
          onChange={(value) => metrics.changes.push(value)}
          onSubmit={(value, slots, skill) => {
            metrics.submits.push(value);
            metrics.submittedSlots.push({
              types: slots.map(({ type }) => type),
              skill: skill?.value,
            });
          }}
          onCancel={() => metrics.cancels++}
          onSpeechEnd={() => metrics.stops++}
          onSpeechError={(message, isUserNotAllow) =>
            metrics.errors.push({ message, isUserNotAllow })
          }
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
