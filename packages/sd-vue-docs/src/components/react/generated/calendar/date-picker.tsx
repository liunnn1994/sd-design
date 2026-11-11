/** @jsxImportSource react */
import { Calendar } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [selectedDate, setSelectedDate] =
    useState<NonNullable<ComponentProps<typeof Calendar>['selectedDate']>>('2025-01-08');
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
      title: '技术讨论',
      backgroundColor: '#10b981',
      color: '#fff',
    },
    {
      start: '2025-01-08 10:00',
      end: '2025-01-08 11:30',
      title: '项目启动会',
      backgroundColor: '#f59e0b',
      color: '#fff',
    },
    {
      start: '2025-01-08 14:00',
      end: '2025-01-08 16:00',
      title: '团队建设',
      backgroundColor: '#8b5cf6',
      color: '#fff',
    },
    {
      start: '2025-01-09 09:00',
      end: '2025-01-09 10:00',
      title: '代码评审',
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
    {
      start: '2025-01-09 15:00',
      end: '2025-01-09 16:00',
      title: '周报撰写',
      backgroundColor: '#10b981',
      color: '#fff',
    },
    {
      start: '2025-01-10 09:30',
      end: '2025-01-10 11:00',
      title: '设计评审',
      backgroundColor: '#ef4444',
      color: '#fff',
    },
    {
      start: '2025-01-10 14:00',
      end: '2025-01-10 15:30',
      title: '客户演示',
      backgroundColor: '#f59e0b',
      color: '#fff',
    },
  ];

  return (
    <>
      <div className={'sd:flex sd:flex-wrap sd:gap-4 sd:items-start'}>
        <Calendar
          datePicker={true}
          selectedDate={selectedDate}
          onUpdateSelectedDate={(next) => setSelectedDate(next as typeof selectedDate)}
          viewDate={selectedDate}
          style={{ width: '280px', height: '380px' }}
        />
        <Calendar
          view={'week'}
          views={['day', 'week', 'month']}
          selectedDate={selectedDate}
          viewDate={selectedDate}
          events={events}
          timeFrom={8 * 60}
          timeTo={20 * 60}
          editableEvents={true}
          snapToInterval={15}
          style={{ flex: '1', minWidth: '360px', height: '620px' }}
        />
      </div>
      <p className={'sd:mt-2 sd:text-sm sd:text-gray-500'}>
        {'当前选中日期: '}
        {formatValue(selectedDate)}
      </p>
    </>
  );
}
