import { useEffect, useRef, useState } from 'react';

import {
  VoiceGlow,
  useVoiceMicrophone,
  type VoiceGlowProps,
  type VoiceGlowType,
  type VoiceGlowTheme,
} from '../../src/index';
function MicrophoneFixture({ autoStart }: { autoStart: boolean }) {
  const mic = useVoiceMicrophone({ autoStart, constraints: { echoCancellation: true } });
  return (
    <div data-testid="voice-mic">
      <button onClick={() => void mic.start()}>Voice mic start</button>
      <button onClick={mic.stop}>Voice mic stop</button>
      <output data-testid="voice-mic-state">{mic.state}</output>
      <output data-testid="voice-mic-error">{mic.error?.message ?? ''}</output>
      <output data-testid="voice-mic-supported">{String(mic.supported)}</output>
      <output data-testid="voice-mic-stream">{mic.stream?.id ?? ''}</output>
    </div>
  );
}
export function VoiceGlowFixture() {
  const [options, setOptions] = useState<VoiceGlowProps>({
    active: false,
    theme: 'dark',
    level: 0.8,
    idle: 0,
    distortion: 0,
  });
  const [mounted, setMounted] = useState(true);
  const [micMounted, setMicMounted] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [refStatus, setRefStatus] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLOutputElement>(null);
  const calls = useRef<HTMLOutputElement>(null);
  const samples = useRef(0);
  const manual = useRef(0.7);
  const audio = useRef<{
    context: AudioContext;
    oscillator: OscillatorNode;
    stream: MediaStream;
  } | null>(null);
  const stopAudio = () => {
    const current = audio.current;
    if (!current) return;
    current.oscillator.stop();
    current.stream.getTracks().forEach((track) => track.stop());
    void current.context.close();
    audio.current = null;
  };
  useEffect(() => stopAudio, []);
  const startAudio = async () => {
    stopAudio();
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const destination = context.createMediaStreamDestination();
    oscillator.frequency.value = 240;
    oscillator.connect(destination);
    oscillator.start();
    await context.resume();
    audio.current = { context, oscillator, stream: destination.stream };
    setStream(destination.stream);
  };
  const patch = (next: VoiceGlowProps) => setOptions((previous) => ({ ...previous, ...next }));
  return (
    <section data-testid="voice-fixture">
      <label>
        Voice preset{' '}
        <select
          aria-label="Voice preset"
          value={options.type ?? 'default'}
          onChange={(event) => patch({ type: event.target.value as VoiceGlowType })}
        >
          {['default', 'pill', 'mobile'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Voice theme{' '}
        <select
          aria-label="Voice theme"
          value={options.theme}
          onChange={(event) => patch({ theme: event.target.value as VoiceGlowTheme })}
        >
          {['dark', 'light', 'auto'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <button onClick={() => patch({ active: !options.active })}>Voice active</button>
      <button onClick={() => patch({ level: 0 })}>Voice silent</button>
      <button onClick={() => patch({ paused: !options.paused })}>Voice pause</button>
      <button onClick={() => patch({ processing: !options.processing })}>Voice processing</button>
      <button onClick={() => patch({ distortion: options.distortion ? 0 : 0.6 })}>
        Voice distortion
      </button>
      <button
        onClick={() =>
          patch({
            level: () => {
              samples.current++;
              if (calls.current) calls.current.textContent = String(samples.current);
              return manual.current;
            },
          })
        }
      >
        Voice getter
      </button>
      <button
        onClick={() => {
          manual.current = 0;
        }}
      >
        Voice getter silent
      </button>
      <button
        onClick={() =>
          patch({
            scale: 0.5,
            borderRadius: 0,
            coreLight: 2,
            strength: 0.3,
            colors: ['#ff0000'],
            bandColors: { core: '#abcdef' },
            css: '[data-voice-beam="{id}"] { --voice-test: 7; }',
          })
        }
      >
        Voice tuning
      </button>
      <button onClick={() => void startAudio()}>Voice synthetic audio</button>
      <button
        onClick={() => {
          stopAudio();
          setStream(null);
        }}
      >
        Voice stop audio
      </button>
      <button onClick={() => setMounted(!mounted)}>Voice mount</button>
      <button onClick={() => setRefStatus(root.current?.tagName ?? 'null')}>Voice ref</button>
      <button onClick={() => setMicMounted(!micMounted)}>Voice mic mount</button>
      <button
        onClick={() => {
          setAutoStart(true);
          setMicMounted(true);
        }}
      >
        Voice mic auto
      </button>
      <output data-testid="voice-events">{events.join('|')}</output>
      <output data-testid="voice-meter" ref={meter}>
        0
      </output>
      <output data-testid="voice-samples" ref={calls}>
        0
      </output>
      <output data-testid="voice-ref">{refStatus}</output>
      <div style={{ padding: 40 }}>
        {mounted && (
          <VoiceGlow
            {...options}
            stream={stream}
            ref={root}
            data-testid="voice-main"
            style={{ width: 350, height: 120 }}
            onLevel={(value) => {
              if (meter.current) meter.current.textContent = value.toFixed(4);
            }}
            onActivate={() => setEvents((previous) => [...previous, 'activate'])}
            onDeactivate={() => setEvents((previous) => [...previous, 'deactivate'])}
          >
            <button style={{ width: 350, height: 120, borderRadius: 12 }}>
              Voice child action
            </button>
          </VoiceGlow>
        )}
      </div>
      {micMounted && <MicrophoneFixture autoStart={autoStart} />}
    </section>
  );
}
