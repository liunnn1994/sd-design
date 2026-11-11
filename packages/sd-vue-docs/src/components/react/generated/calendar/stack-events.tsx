/** @jsxImportSource react */
import { Calendar } from '@sdata/web-react';

export default function Example() {
  const events = [
    {
      start: '2025-01-08 11:30',
      end: '2025-01-08 14:00',
      title: '牙医预约',
      class: 'health',
    },
    {
      start: '2025-01-08 12:00',
      end: '2025-01-08 14:00',
      title: '事件 1',
      class: 'leisure',
    },
    {
      start: '2025-01-08 12:00',
      end: '2025-01-08 14:00',
      title: '事件 2',
      class: 'sport',
    },
  ];

  return (
    <>
      <Calendar
        view={'day'}
        viewDate={'2025-01-08'}
        views={['day']}
        events={events}
        stackEvents={true}
        timeFrom={9 * 60}
        timeTo={16 * 60}
        editableEvents={true}
        style={{ height: '560px' }}
      />
    </>
  );
}
