import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ConfigProvider } from '../../src/config-provider/index.js';
import { Picker, type PickerProps } from '../../src/date-picker/picker.js';
import { RangePicker } from '../../src/date-picker/range-picker.js';
import enUS from '../../src/locale/lang/en-us.js';
import '../../styles/date-picker.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const range = query.has('range');
  const local = query.has('local');
  const [updated, setUpdated] = useState(false);
  const common = {
    hideTrigger: !query.has('preview'),
    defaultPickerValue: '2026-11-08',
    mode: query.has('month') ? 'month' : 'date',
    dayStartOfWeek: local ? 0 : undefined,
    showConfirmBtn: local ? false : undefined,
    showNowBtn: local ? true : undefined,
    shortcuts: local ? [] : undefined,
    abbreviation: local ? true : undefined,
  } satisfies PickerProps;
  return (
    <>
      <button onClick={() => setUpdated(!updated)}>Update provider</button>
      <ConfigProvider
        locale={query.has('month') ? enUS : undefined}
        datePicker={{
          dayStartOfWeek: updated ? 2 : 1,
          shortcuts: updated
            ? []
            : [{ label: 'Configured', value: range ? ['2026-12-01', '2026-12-20'] : '2026-12-01' }],
          shortcutsPosition: updated ? 'right' : 'left',
          showConfirmBtn: true,
          showNowBtn: updated,
          previewShortcut: updated,
          abbreviation: false,
        }}
      >
        {range ? (
          <RangePicker
            {...common}
            defaultPickerValue={['2026-11-08', '2026-12-18']}
            defaultValue={['2026-11-08', '2026-12-18']}
          />
        ) : (
          <Picker {...common} defaultValue="2026-11-08" />
        )}
      </ConfigProvider>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
