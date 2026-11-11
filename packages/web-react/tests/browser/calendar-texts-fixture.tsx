import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import enUS from '@sdata/web-core/locale/lang/en-us';
import zhCN from '@sdata/web-core/locale/lang/zh-cn';
import { useState } from 'react';

import { useCalendarTexts } from '../../src/calendar/use-texts.js';
import { ConfigProvider } from '../../src/config-provider/index.js';

function Texts({ id, locale, sunday }: { id: string; locale?: string; sunday?: boolean }) {
  const texts = useCalendarTexts({ locale, startWeekOnSunday: sunday });
  const date = createDateUtils(() => texts.dateLocale);
  return (
    <output data-testid={id}>
      {texts.today}|{texts.months[0]}|{texts.weekDays[0]}|
      {date.formatDate(new Date(2026, 0, 5), 'MMMM')}|{texts.dateLocale}
    </output>
  );
}
export function CalendarTextsFixture() {
  const [english, setEnglish] = useState(false);
  const [override, setOverride] = useState<string>();
  const [sunday, setSunday] = useState(false);
  const [mounted, setMounted] = useState(true);
  return (
    <ConfigProvider locale={english ? enUS : zhCN}>
      <button onClick={() => setEnglish(!english)}>Global language</button>
      <button onClick={() => setOverride(override ? undefined : 'en-us')}>Override language</button>
      <button onClick={() => setSunday(!sunday)}>Week start</button>
      <button onClick={() => setMounted(!mounted)}>Mount texts</button>
      {mounted && <Texts id="calendar-texts-live" locale={override} sunday={sunday} />}
      <Texts id="calendar-texts-fixed" locale="en-us" />
    </ConfigProvider>
  );
}
