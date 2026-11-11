import { useRef, useState } from 'react';

import {
  ThinkingOrb,
  ConfigProvider,
  type ThinkingOrbState,
  type ThinkingOrbSize,
} from '../../src/index';
import enUS from '../../src/locale/lang/en-us';
const states: ThinkingOrbState[] = [
  'working',
  'searching',
  'solving',
  'listening',
  'connecting',
  'weaving',
  'composing',
  'breathing',
  'shaping',
];
export function ThinkingOrbFixture() {
  const [paused, setPaused] = useState(false);
  const [size, setSize] = useState<ThinkingOrbSize>(64);
  const [speed, setSpeed] = useState(1);
  const [dark, setDark] = useState(false);
  const [english, setEnglish] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [refStatus, setRefStatus] = useState('');
  const ref = useRef<HTMLCanvasElement>(null);
  return (
    <section data-testid="orb-fixture" sd-theme={dark ? 'dark' : 'light'}>
      <button onClick={() => setPaused(!paused)}>Orb pause</button>
      <button onClick={() => setSize(size === 64 ? 20 : 64)}>Orb size</button>
      <button onClick={() => setSpeed(speed === 1 ? -1 : 1)}>Orb reverse</button>
      <button onClick={() => setDark(!dark)}>Orb theme</button>
      <button onClick={() => setEnglish(!english)}>Orb locale</button>
      <button onClick={() => setMounted(!mounted)}>Orb mount</button>
      <button onClick={() => setRefStatus(ref.current?.tagName ?? 'null')}>Orb ref</button>
      <output data-testid="orb-ref">{refStatus}</output>
      <ConfigProvider locale={english ? enUS : undefined}>
        {mounted && (
          <ThinkingOrb data-testid="orb-main" ref={ref} paused={paused} size={size} speed={speed} />
        )}
        <ThinkingOrb data-testid="orb-explicit" theme="light" paused />
        <div style={{ display: 'flex', gap: 8 }}>
          {states.map((state) => (
            <ThinkingOrb key={state} data-testid={`orb-${state}`} state={state} paused size={20} />
          ))}
        </div>
      </ConfigProvider>
    </section>
  );
}
