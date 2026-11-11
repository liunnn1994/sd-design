import { DatePicker, RangePicker } from '@sdata/web-react';
/** @jsxImportSource react */
import dayjs from 'dayjs';

export default function Example() {
  const shortcuts = [
    {
      label: '昨天',
      value: () => dayjs().subtract(1, 'day').toDate(),
    },
    {
      label: '今天',
      value: () => dayjs().toDate(),
    },
    {
      label: '一周后',
      value: () => dayjs().add(1, 'week').toDate(),
    },
    {
      label: '一个月后',
      value: () => dayjs().add(1, 'month').toDate(),
    },
    {
      label: '两个月后',
      value: () => dayjs().add(2, 'month').toDate(),
    },
  ];
  const rangeShortcuts = [
    {
      label: '未来两天',
      value: () => [dayjs().toDate(), dayjs().add(2, 'day').toDate()],
    },
    {
      label: '未来七天',
      value: () => [dayjs().toDate(), dayjs().add(1, 'week').toDate()],
    },
    {
      label: '未来三十天',
      value: () => [dayjs().toDate(), dayjs().add(1, 'month').toDate()],
    },
    {
      label: '未来六个月',
      value: () => [dayjs().toDate(), dayjs().add(6, 'month').toDate()],
    },
    {
      label: '未来十二个月',
      value: () => [dayjs().toDate(), dayjs().add(1, 'year').toDate()],
    },
    {
      label: '未来十年',
      value: () => [dayjs().toDate(), dayjs().add(10, 'year').toDate()],
    },
  ];

  return (
    <>
      <div className={'sd:w-63.5 sd:mr-6 sd:mb-5'}>
        <DatePicker shortcutsPosition={'left'} shortcuts={shortcuts} />
      </div>
      <div className={'sd:w-75 sd:mb-5'}>
        <RangePicker shortcutsPosition={'left'} shortcuts={rangeShortcuts} />
      </div>
      <div className={'sd:w-63.5 sd:mr-6'}>
        <DatePicker shortcutsPosition={'right'} shortcuts={shortcuts} />
      </div>
      <div className={'sd:w-75'}>
        <RangePicker shortcutsPosition={'right'} shortcuts={rangeShortcuts} />
      </div>
    </>
  );
}
