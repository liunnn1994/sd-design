import { StrictMode, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import { Avatar } from '../../src/avatar';
import { Badge } from '../../src/badge';
import { Button } from '../../src/button';
import { NumberFlow, NumberFlowGroup } from '../../src/number-flow';
import '../../styles/avatar.scss';
import '../../styles/badge.scss';
import '../../styles/button.scss';
import '../../styles/number-flow.scss';

function Fixture() {
  const [number, setNumber] = useState(9);
  const [numberEvents, setNumberEvents] = useState('');
  const [formatted, setFormatted] = useState('-1234.5');
  const [willChange, setWillChange] = useState(true);
  return (
    <>
      <Badge data-testid="count-badge" status="success" count={number} maxCount={10}>
        <Avatar>SD</Avatar>
      </Badge>
      <Badge data-testid="dot-badge" dot count={number} />
      <NumberFlow
        data-testid="number-flow"
        value={number}
        respectMotionPreference={false}
        transformTiming={{ duration: 100 }}
        opacityTiming={{ duration: 100 }}
        onAnimationsStart={() => setNumberEvents((events) => events + 'S')}
        onAnimationsFinish={() => setNumberEvents((events) => events + 'F')}
      />
      <NumberFlow data-testid="static-number-flow" value={number} animated={false} />
      <NumberFlowGroup data-testid="number-group">
        <NumberFlow data-testid="group-first" value={number} respectMotionPreference={false} />
        <NumberFlow data-testid="group-second" value={number * 2} respectMotionPreference={false} />
        <NumberFlow data-testid="group-unchanged" value={42} respectMotionPreference={false} />
      </NumberFlowGroup>
      <Button onClick={() => setNumber((n) => n + 1)}>增加数值</Button>
      <output data-testid="number-events">{numberEvents}</output>
      <label>
        Formatted number
        <input value={formatted} onChange={(event) => setFormatted(event.currentTarget.value)} />
      </label>
      <NumberFlow
        data-testid="formatted-flow"
        value={formatted}
        locales="en-US"
        format={{ minimumFractionDigits: 2 }}
        prefix="ignored"
        prefixContent={<strong>Decorative prefix</strong>}
        nonce="example-nonce"
        animated={false}
        willChange={willChange}
      />
      <button onClick={() => setWillChange(!willChange)}>Toggle will-change</button>
      <NumberFlow data-testid="motion-flow" value={number} />
    </>
  );
}

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Fixture />
    </StrictMode>,
  ),
);
