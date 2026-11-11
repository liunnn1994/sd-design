import { useRef, useState } from 'react';

import { ConfigProvider, Progress } from '../../src/index';
export function ProgressFixture() {
  const [mounted, setMounted] = useState(false);
  const [percent, setPercent] = useState(0.25);
  const [mini, setMini] = useState(false);
  const [steps, setSteps] = useState(0);
  const [danger, setDanger] = useState(false);
  const [custom, setCustom] = useState(false);
  const [showText, setShowText] = useState(true);
  const [wide, setWide] = useState(false);
  const [gradient, setGradient] = useState(true);
  const [refTag, setRefTag] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const colors = { '0%': '#ff0000', '100%': '#0000ff' };
  const renderText = ({ percent }: { percent: number }) => {
    if (!showText || (mini && !steps)) throw new Error('Hidden progress text was rendered');
    return `Value ${percent}`;
  };
  return (
    <section>
      <button onClick={() => setMounted(!mounted)}>
        {mounted ? 'Unmount Progress' : 'Mount Progress'}
      </button>
      {mounted && (
        <>
          <button onClick={() => setPercent(percent === 1 ? 0.25 : 1)}>
            Toggle Progress percent
          </button>
          <button onClick={() => setMini(!mini)}>Toggle Progress mini</button>
          <button onClick={() => setSteps(steps ? 0 : 4)}>Toggle Progress steps</button>
          <button onClick={() => setDanger(!danger)}>Toggle Progress danger</button>
          <button onClick={() => setCustom(!custom)}>Toggle Progress text</button>
          <button onClick={() => setShowText(!showText)}>Toggle Progress visibility</button>
          <button onClick={() => setWide(!wide)}>Toggle Progress width</button>
          <button onClick={() => setGradient(!gradient)}>Toggle Progress gradient</button>
          <button onClick={() => setRefTag(ref.current?.tagName ?? '')}>Read Progress ref</button>
          <output data-testid="progress-ref">{refTag}</output>
          <ConfigProvider size={mini ? 'mini' : 'large'}>
            <Progress
              ref={ref}
              data-testid="progress-line"
              percent={percent}
              steps={steps}
              width={wide ? '75%' : 160}
              strokeWidth={wide ? undefined : 4}
              color={gradient ? colors : '#00ff00'}
              trackColor="#112233"
              animation
              status={danger ? 'danger' : undefined}
              showText={showText}
              text={custom ? renderText : undefined}
            />
            <Progress
              data-testid="progress-circle"
              type="circle"
              percent={percent}
              steps={steps}
              width={wide ? 96 : undefined}
              color={gradient ? colors : '#00ff00'}
              status={danger ? 'danger' : undefined}
              showText={showText}
              text={custom ? renderText : undefined}
            />
            <Progress
              data-testid="progress-second"
              type="circle"
              percent={0.5}
              color={{ '0%': '#00ff00', '100%': '#ffff00' }}
            />
          </ConfigProvider>
        </>
      )}
    </section>
  );
}
