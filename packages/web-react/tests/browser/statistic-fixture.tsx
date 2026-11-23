import { useState } from 'react';

import { Countdown, Statistic } from '../../src/statistic/index.js';

function Examples() {
  const [now] = useState(() => Date.now());
  const [value, setValue] = useState<number | undefined>(1234.5);
  const [start, setStart] = useState(false);
  const [deadline, setDeadline] = useState(now + 2000);
  const [format, setFormat] = useState('ss');
  const [finishes, setFinishes] = useState(0);
  const [shown, setShown] = useState(true);
  return (
    <>
      <button onClick={() => setValue(value === undefined ? 2345.75 : undefined)}>
        Toggle statistic value
      </button>
      <button onClick={() => setStart(!start)}>Toggle statistic start</button>
      <button onClick={() => setDeadline(Date.now() + 3000)}>Reset countdown deadline</button>
      <button onClick={() => setFormat(format === 'ss' ? 'mm:ss' : 'ss')}>
        Toggle countdown format
      </button>
      <button onClick={() => setShown(!shown)}>Toggle countdown mount</button>
      <Statistic
        data-testid="statistic-number"
        title={<strong>Revenue</strong>}
        value={value}
        precision={2}
        showGroupSeparator
        animation={false}
        placeholder="Pending"
        prefix="$"
        suffix="USD"
        extra="Today"
        valueStyle={{ color: 'rgb(1, 2, 3)' }}
      />
      <Statistic data-testid="statistic-start" value={10} valueFrom={2} start={start} />
      <Statistic data-testid="statistic-date" value={new Date(2026, 0, 2)} format="YYYY-MM-DD" />
      {shown && (
        <Countdown
          data-testid="statistic-countdown"
          title="Deadline"
          now={now}
          value={deadline}
          start={start}
          format={format}
          animation={false}
          onFinish={() => setFinishes((n) => n + 1)}
        />
      )}
      <output data-testid="statistic-finishes">{finishes}</output>
    </>
  );
}
export function StatisticFixture() {
  const [mounted, setMounted] = useState(false);
  return (
    <section>
      <button onClick={() => setMounted(!mounted)}>
        {mounted ? 'Unmount statistics' : 'Mount statistics'}
      </button>
      {mounted && <Examples />}
    </section>
  );
}
