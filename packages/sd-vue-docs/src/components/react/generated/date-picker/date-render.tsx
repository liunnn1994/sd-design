/** @jsxImportSource react */
import { DatePicker } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const highlightDates = [6, 14, 22];
  const highlightClass = 'sd:border';
  function getCellClass(date: Date) {
    return highlightDates.includes(date.getDate()) ? highlightClass : undefined;
  }

  return (
    <>
      <DatePicker
        renderCell={(date) => (
          <>
            <div className={'sd-picker-date'}>
              <div className={getCellClass(date)}>{formatValue(date.getDate())}</div>
            </div>
          </>
        )}
      />
    </>
  );
}
