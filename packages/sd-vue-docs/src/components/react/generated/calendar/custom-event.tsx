/** @jsxImportSource react */
import { Calendar } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const events = [
    {
      start: '2025-01-06 09:00',
      end: '2025-01-06 11:00',
      title: '产品规划会议',
      backgroundColor: '#3b82f6',
      color: '#fff',
      location: '3F-会议室A',
    },
    {
      start: '2025-01-07 10:00',
      end: '2025-01-07 11:30',
      title: '设计走查',
      backgroundColor: '#10b981',
      color: '#fff',
      location: '线上',
    },
    {
      start: '2025-01-08 14:00',
      end: '2025-01-08 15:30',
      title: '开发同步会',
      backgroundColor: '#f59e0b',
      color: '#fff',
      location: '5F-开放区',
    },
    {
      start: '2025-01-09 09:30',
      end: '2025-01-09 10:30',
      title: '用户访谈',
      backgroundColor: '#8b5cf6',
      color: '#fff',
      location: '线上',
    },
    {
      start: '2025-01-10 15:00',
      end: '2025-01-10 16:00',
      title: '发布准备',
      backgroundColor: '#ef4444',
      color: '#fff',
      location: '3F-会议室B',
    },
  ];

  return (
    <>
      <Calendar
        view={'week'}
        viewDate={'2025-01-08'}
        views={['day', 'week']}
        events={events}
        timeFrom={9 * 60}
        timeTo={18 * 60}
        style={{ height: '560px' }}
        renderEvent={(event) => (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                padding: '2px 4px',
                fontSize: '12px',
                lineHeight: '1.4',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: event.backgroundColor,
                  marginTop: '4px',
                }}
              />
              <div style={{ minWidth: '0', overflow: 'hidden' }}>
                <div
                  style={{
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {formatValue(event.title)}
                </div>
                <div style={{ opacity: '0.8', fontSize: '11px', whiteSpace: 'nowrap' }}>
                  {formatValue(event._.startTimeFormatted24)}
                  {' - '}
                  {formatValue(event._.endTimeFormatted24)}
                </div>
                {event.location ? (
                  <div
                    style={{
                      opacity: '0.7',
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {' 📍 '}
                    {formatValue(event.location)}
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      />
    </>
  );
}
