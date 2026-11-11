import zhCN from '@sdata/web-core/locale/lang/zh-cn';
import { ConfigProvider, addI18nMessages, useLocale } from '@sdata/web-react';
import { Calendar } from '@sdata/web-react/calendar';
import { useState } from 'react';

export function CalendarLocaleRootFixture() {
  const [message, setMessage] = useState(zhCN);
  const [locale, setLocale] = useState('en-us');
  const [size, setSize] = useState(0);
  return (
    <>
      <button
        onClick={() => setMessage({ ...zhCN, calendar: { ...zhCN.calendar, today: '回到今天' } })}
      >
        Provider message
      </button>
      <button
        onClick={() => {
          addI18nMessages(
            { 'calendar-test': { ...zhCN, locale: 'calendar-test' } },
            { overwrite: true },
          );
          useLocale('calendar-test');
        }}
      >
        Global language
      </button>
      <button
        onClick={() =>
          addI18nMessages(
            {
              'calendar-test': {
                ...zhCN,
                locale: 'calendar-test',
                calendar: { ...zhCN.calendar, today: '返回当天' },
              },
            },
            { overwrite: true },
          )
        }
      >
        Global message
      </button>
      <button onClick={() => setLocale('zh-cn')}>Chinese</button>
      <button onClick={() => setLocale('en')}>English alias</button>
      <button onClick={() => setSize(size + 1)}>Smaller</button>
      <ConfigProvider locale={message}>
        <Calendar
          id="provider"
          view="month"
          viewDate="2025-01-08"
          style={{ width: 800, height: 400 }}
        />
      </ConfigProvider>
      <Calendar
        id="english"
        view="month"
        viewDate="2025-01-08"
        locale={locale}
        sm={size > 0}
        xs={size > 1}
        style={{ width: 800, height: 400 }}
      />
      <Calendar
        id="global"
        view="month"
        viewDate="2025-01-08"
        style={{ width: 800, height: 400 }}
      />
    </>
  );
}
