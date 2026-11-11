import { getDateShortcutValue } from '@sdata/web-core/date-picker/values';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { DatePickerContext } from '../../src/date-picker/context.js';
import { DatePanelFooter } from '../../src/date-picker/panel-footer.js';
import { DatePanelShortcuts } from '../../src/date-picker/panel-shortcuts.js';
import { useI18n } from '../../src/locale/index.js';
import '../../styles/button.scss';
import '../../styles/link.scss';
import '@sdata/web-core/styles/_components/picker/style/index.scss';
import '@sdata/web-core/styles/date-picker/style/index.scss';

function Fixture() {
  const [disabled, setDisabled] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const [factory, setFactory] = useState(0);
  const { t } = useI18n();
  const record = (event: string) => setEvents((items) => [...items, event]);
  return (
    <DatePickerContext.Provider value={{ datePickerT: t }}>
      <button onClick={() => setDisabled(!disabled)}>Toggle confirm</button>
      <DatePanelShortcuts
        prefixCls="sd-picker"
        showNowBtn
        shortcuts={[
          {
            label: () => <b>Midmonth</b>,
            value: () => {
              setFactory((count) => count + 1);
              return '2026-11-15';
            },
          },
          { label: 0, value: 0 },
        ]}
        onNowClick={() => record('now')}
        onItemClick={(item) =>
          record(`click:${getDateShortcutValue(item, 'YYYY-MM-DD')?.format('YYYY-MM-DD')}`)
        }
        onItemMouseEnter={(item) =>
          record(typeof item.label === 'function' ? 'enter:midmonth' : 'enter:zero')
        }
        onItemMouseLeave={(item) =>
          record(typeof item.label === 'function' ? 'leave:midmonth' : 'leave:zero')
        }
      />
      <DatePanelFooter
        prefixCls="sd-picker"
        showTodayBtn
        showConfirmBtn
        confirmBtnDisabled={disabled}
        extra={<span>Extra footer</span>}
        buttons={<button onClick={() => record('custom')}>Custom action</button>}
        onTodayClick={() => record('today')}
        onConfirmClick={() => record('confirm')}
      />
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="factory">{factory}</output>
    </DatePickerContext.Provider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
