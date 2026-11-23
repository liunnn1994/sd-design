import { useRef, useState } from 'react';

import {
  BorderBeam,
  type BorderBeamProps,
  type BorderBeamExposed,
  type BorderBeamSize,
  type BorderBeamColorVariant,
  type BorderBeamTheme,
} from '../../src/border-beam/index.js';
export function BorderBeamFixture() {
  const [options, setOptions] = useState<BorderBeamProps>({ active: false, size: 'md' });
  const [large, setLarge] = useState(false);
  const [radius, setRadius] = useState(12);
  const [key, setKey] = useState(0);
  const [empty, setEmpty] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const [refStatus, setRefStatus] = useState('');
  const api = useRef<BorderBeamExposed>(null);
  const second = useRef<BorderBeamExposed>(null);
  const patch = (next: BorderBeamProps) => setOptions((previous) => ({ ...previous, ...next }));
  return (
    <section data-testid="beam-fixture">
      <label>
        Beam size{' '}
        <select
          aria-label="Beam size"
          value={options.size}
          onChange={(event) => patch({ size: event.target.value as BorderBeamSize })}
        >
          {['sm', 'md', 'line', 'pulse-inner', 'pulse-outside'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Beam color{' '}
        <select
          aria-label="Beam color"
          value={options.colorVariant ?? 'colorful'}
          onChange={(event) =>
            patch({ colorVariant: event.target.value as BorderBeamColorVariant })
          }
        >
          {['colorful', 'mono', 'ocean', 'sunset'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Beam theme{' '}
        <select
          aria-label="Beam theme"
          value={options.theme ?? 'dark'}
          onChange={(event) => patch({ theme: event.target.value as BorderBeamTheme })}
        >
          {['dark', 'light', 'auto'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <button onClick={() => patch({ active: !options.active })}>Beam active</button>
      <button onClick={() => api.current?.flowFrom()}>Beam default flow</button>
      <button onClick={() => api.current?.flowFrom('center')}>Beam center flow</button>
      <button onClick={() => api.current?.flowFrom({ x: 25, y: 30 })}>Beam custom flow</button>
      <button onClick={() => second.current?.flowFrom('bottom-left')}>Beam second flow</button>
      <button onClick={() => setLarge(!large)}>Beam resize</button>
      <button onClick={() => setRadius(radius === 12 ? 24 : 12)}>Beam child radius</button>
      <button onClick={() => setRadius(0)}>Beam zero radius</button>
      <button onClick={() => setKey(key + 1)}>Beam replace child</button>
      <button onClick={() => setEmpty(!empty)}>Beam empty</button>
      <button
        onClick={() =>
          patch({
            strength: 2,
            density: 0,
            borderRadius: 5,
            duration: 7,
            brightness: 2,
            saturation: 3,
            hueRange: 50,
          })
        }
      >
        Beam tuning
      </button>
      <button onClick={() => patch({ borderRadius: undefined })}>Beam clear radius override</button>
      <button onClick={() => patch({ staticColors: !options.staticColors })}>
        Beam static colors
      </button>
      <button onClick={() => setMounted(!mounted)}>Beam mount</button>
      <button onClick={() => setRefStatus(api.current ? 'connected' : 'null')}>Beam ref</button>
      <output data-testid="beam-events">{events.join('|')}</output>
      <output data-testid="beam-ref">{refStatus}</output>
      <div style={{ padding: 30 }}>
        {mounted && (
          <BorderBeam
            {...options}
            ref={api}
            data-testid="beam-main"
            onActivate={() => setEvents((previous) => [...previous, 'activate'])}
            onDeactivate={() => setEvents((previous) => [...previous, 'deactivate'])}
          >
            {!empty && (
              <div
                key={key}
                data-testid="beam-child"
                style={{
                  width: large ? 700 : 350,
                  height: large ? 280 : 140,
                  borderRadius: radius,
                  background: '#202838',
                }}
              >
                <button>Beam child action</button>
              </div>
            )}
          </BorderBeam>
        )}
      </div>
      <BorderBeam ref={second} active={false} data-testid="beam-second">
        <span>Second beam</span>
      </BorderBeam>
    </section>
  );
}
