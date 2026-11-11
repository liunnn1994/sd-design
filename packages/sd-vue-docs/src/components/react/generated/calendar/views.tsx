/** @jsxImportSource react */
import { Calendar, Radio, RadioGroup } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const availableViews = ['day', 'week', 'month', 'year'] as const;
  const viewLabels: Record<string, string> = {
    day: '日',
    week: '周',
    month: '月',
    year: '年',
  };
  const [currentView, setCurrentView] = useState('week');
  const events = [
    {
      start: '2025-01-06 09:00',
      end: '2025-01-06 11:00',
      title: '需求评审',
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
    {
      start: '2025-01-07 14:00',
      end: '2025-01-07 15:30',
      title: '设计评审',
      backgroundColor: '#10b981',
      color: '#fff',
    },
    {
      start: '2025-01-08 10:00',
      end: '2025-01-08 11:30',
      title: '开发进度同步',
      backgroundColor: '#f59e0b',
      color: '#fff',
    },
    {
      start: '2025-01-09 09:00',
      end: '2025-01-09 11:00',
      title: '用户测试',
      backgroundColor: '#8b5cf6',
      color: '#fff',
    },
    {
      start: '2025-01-10 15:00',
      end: '2025-01-10 16:30',
      title: '复盘总结',
      backgroundColor: '#ef4444',
      color: '#fff',
    },
  ];

  return (
    <>
      <div>
        <div className={'sd:mb-3 sd:flex sd:flex-wrap sd:gap-2'}>
          <RadioGroup
            type={'button'}
            value={currentView}
            onValueChange={(next) => setCurrentView(next as typeof currentView)}
          >
            {Object.entries(availableViews).map(([__key, v]) => (
              <Radio key={v} value={v}>
                {formatValue(viewLabels[v])}
              </Radio>
            ))}
          </RadioGroup>
        </div>
        <Calendar
          view={currentView}
          onUpdateView={(next) => setCurrentView(next as typeof currentView)}
          viewDate={'2025-01-08'}
          views={availableViews}
          events={events}
          timeFrom={8 * 60}
          timeTo={18 * 60}
          style={{ height: '560px' }}
        />
      </div>
    </>
  );
}
