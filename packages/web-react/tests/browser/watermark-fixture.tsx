import { useRef, useState } from 'react';

import { Watermark } from '../../src/index';
const gap: [number, number] = [20, 30];
const offset: [number, number] = [40, 50];
const image = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="30"><rect width="80" height="30" fill="red"/></svg>')}`;
export function WatermarkFixture() {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState('Private');
  const [tamper, setTamper] = useState(true);
  const [picture, setPicture] = useState(false);
  const [gray, setGray] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const [shift, setShift] = useState(false);
  const [count, setCount] = useState(0);
  const [refTag, setRefTag] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  return (
    <section>
      <button onClick={() => setMounted(!mounted)}>
        {mounted ? 'Unmount Watermark' : 'Mount Watermark'}
      </button>
      <button onClick={() => setText(text === 'Private' ? 'Updated' : 'Private')}>
        Update Watermark text
      </button>
      <button onClick={() => setTamper(!tamper)}>Toggle Watermark protection</button>
      <button onClick={() => setPicture(!picture)}>Toggle Watermark image</button>
      <button onClick={() => setGray(!gray)}>Toggle Watermark grayscale</button>
      <button onClick={() => setRepeat(!repeat)}>Toggle Watermark repeat</button>
      <button onClick={() => setShift(!shift)}>Toggle Watermark offset</button>
      <button onClick={() => setRefTag(ref.current?.tagName ?? '')}>Read Watermark ref</button>
      <output data-testid="watermark-ref">{refTag}</output>
      {mounted && (
        <Watermark
          ref={ref}
          data-testid="watermark"
          content={text}
          width={80}
          height={30}
          gap={gap}
          offset={shift ? offset : undefined}
          rotate={0}
          alpha={0.5}
          zIndex={9}
          antiTamper={tamper}
          image={picture ? image : undefined}
          grayscale={gray}
          repeat={repeat}
          style={{ height: 150 }}
        >
          <button onClick={() => setCount(count + 1)}>Watermark child {count}</button>
        </Watermark>
      )}
    </section>
  );
}
