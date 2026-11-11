/** @jsxImportSource react */
import { RangePicker } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  type RangeDateLike = Date | number | string;
  const [dates, setDates] = useState<RangeDateLike[]>([]);
  function getDayDistance(current: RangeDateLike, target: RangeDateLike) {
    return Math.abs(
      (new Date(current).getTime() - new Date(target).getTime()) / (24 * 60 * 60 * 1000),
    );
  }
  function onSelect(value: (RangeDateLike | undefined)[], _date: unknown, _dateString: unknown) {
    setDates(value.filter((item): item is RangeDateLike => item !== undefined));
  }
  function onPopupVisibleChange(visible: boolean) {
    if (!visible) {
      setDates([]);
    }
  }
  function disabledDate(current: RangeDateLike) {
    const selectedDates = dates;
    if (selectedDates.length === 0) {
      return false;
    }

    const tooLate = selectedDates[0] ? getDayDistance(current, selectedDates[0]) > 7 : false;
    const tooEarly = selectedDates[1] ? getDayDistance(current, selectedDates[1]) > 7 : false;

    return tooEarly || tooLate;
  }

  return (
    <>
      <div className={'sd:w-75'}>
        <RangePicker
          onSelect={onSelect}
          onPopupVisibleChange={onPopupVisibleChange}
          disabledDate={disabledDate}
        />
      </div>
    </>
  );
}
