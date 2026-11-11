/** @jsxImportSource react */
import { Calendar, Select } from '@sdata/web-react';
import { type CSSProperties, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [hoursVariant, setHoursVariant] = useState('business');
  const hoursVariantOptions = [
    { value: 'business', label: '简单营业时间' },
    { value: 'doctors', label: '医生轮班' },
  ];
  const scheduleHoursModeOptions = [
    { value: 'none', label: '关闭' },
    { value: 'shared', label: '共用时段' },
    { value: 'perSchedule', label: '按排班区分' },
  ];
  const businessHours = {
    mon: { from: 9 * 60, to: 18 * 60, class: 'business-hours', label: '营业中' },
    tue: { from: 9 * 60, to: 18 * 60, class: 'business-hours', label: '营业中' },
    wed: [
      { from: 9 * 60, to: 12 * 60, class: 'business-hours', label: '上午营业' },
      { from: 14 * 60, to: 18 * 60, class: 'business-hours', label: '下午营业' },
    ],
    thu: { from: 9 * 60, to: 18 * 60, class: 'business-hours', label: '营业中' },
    fri: { from: 9 * 60, to: 17 * 60, class: 'business-hours', label: '提前关门' },
  };
  const doctorHours = {
    mon: { from: 8 * 60, to: 17 * 60, class: 'doctor-1', label: '医生 1|全天班' },
    tue: { from: 9 * 60, to: 18 * 60, class: 'doctor-2', label: '医生 2|全天班' },
    wed: [
      { from: 8 * 60, to: 12 * 60, class: 'doctor-1', label: '医生 1|上午班' },
      { from: 14 * 60, to: 19 * 60, class: 'doctor-3', label: '医生 3|下午班' },
    ],
    thu: { from: 8 * 60, to: 17 * 60, class: 'doctor-1', label: '医生 1|全天班' },
    fri: { from: 9 * 60, to: 18 * 60, class: 'doctor-3', label: '医生 3|全天班' },
    sat: { from: 9 * 60, to: 18 * 60, class: 'doctor-2', label: '医生 2|全天班' },
    sun: { from: 7 * 60, to: 20 * 60, class: 'closed', label: '休息' },
  };
  const currentSpecialHours = (() => (hoursVariant === 'business' ? businessHours : doctorHours))();
  const specialHoursEvents = [
    {
      start: '2026-06-16 09:00',
      end: '2026-06-16 10:30',
      title: '团队早会',
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
    {
      start: '2026-06-16 14:00',
      end: '2026-06-16 15:00',
      title: '客户会议',
      backgroundColor: '#10b981',
      color: '#fff',
    },
    {
      start: '2026-06-18 11:00',
      end: '2026-06-18 12:30',
      title: '设计评审',
      backgroundColor: '#f59e0b',
      color: '#fff',
    },
  ];
  const [scheduleHoursMode, setScheduleHoursMode] = useState('perSchedule');
  const scheds = [
    { id: 'dr-lee', class: 'doctor doctor--lee', label: '李医生' },
    { id: 'dr-kim', class: 'doctor doctor--kim', label: '金医生' },
    { id: 'lab', class: 'doctor doctor--lab', label: '化验室' },
  ];
  const scheduleEvts = [
    {
      start: '2026-06-15 08:30',
      end: '2026-06-15 10:00',
      title: '查房',
      class: 's-event-health',
      schedule: 'dr-lee',
    },
    {
      start: '2026-06-15 11:00',
      end: '2026-06-15 12:00',
      title: '会诊',
      class: 's-event-health',
      schedule: 'dr-kim',
    },
    {
      start: '2026-06-15 14:00',
      end: '2026-06-15 17:00',
      title: '化验',
      class: 's-event-leisure',
      schedule: 'lab',
    },
    {
      start: '2026-06-16 09:00',
      end: '2026-06-16 10:30',
      title: '巡房',
      class: 's-event-health',
      schedule: 'dr-lee',
    },
    {
      start: '2026-06-16 13:00',
      end: '2026-06-16 15:00',
      title: '急诊',
      class: 's-event-health',
      schedule: 'dr-kim',
    },
    {
      start: '2026-06-17 10:00',
      end: '2026-06-17 12:30',
      title: '筛查',
      class: 's-event-leisure',
      schedule: 'lab',
    },
    {
      start: '2026-06-18 13:30',
      end: '2026-06-18 16:00',
      title: '复查',
      class: 's-event-health',
      schedule: 'dr-lee',
    },
    {
      start: '2026-06-19 18:00',
      end: '2026-06-19 20:00',
      title: '夜诊',
      class: 's-event-health',
      schedule: 'dr-kim',
    },
  ];
  const sharedHours = {
    mon: { from: 8 * 60, to: 18 * 60, class: 'clinic-hours', label: '门诊时间' },
    tue: { from: 8 * 60, to: 18 * 60, class: 'clinic-hours', label: '门诊时间' },
    wed: [
      { from: 8 * 60, to: 12 * 60, class: 'clinic-hours', label: '门诊时间' },
      { from: 13 * 60, to: 18 * 60, class: 'clinic-hours', label: '门诊时间' },
    ],
    thu: { from: 8 * 60, to: 18 * 60, class: 'clinic-hours', label: '门诊时间' },
    fri: { from: 8 * 60, to: 16 * 60, class: 'clinic-hours', label: '门诊时间' },
  };
  const perScheduleHours = {
    mon: {
      default: { from: 8 * 60, to: 18 * 60, class: 'clinic-hours', label: '门诊时间' },
      schedules: {
        'dr-lee': [
          { from: 8 * 60, to: 12 * 60, class: 'doctor-1', label: '李医生|上午门诊' },
          { from: 13 * 60, to: 17 * 60, class: 'doctor-1', label: '李医生|下午门诊' },
        ],
        'dr-kim': { from: 10 * 60, to: 19 * 60, class: 'doctor-2', label: '金医生|晚班' },
      },
    },
    tue: {
      default: { from: 8 * 60, to: 18 * 60, class: 'clinic-hours', label: '门诊时间' },
      schedules: {
        'dr-lee': { from: 8 * 60, to: 14 * 60, class: 'doctor-1', label: '李医生|半天' },
      },
    },
    wed: {
      default: [
        { from: 8 * 60, to: 12 * 60, class: 'clinic-hours', label: '门诊时间' },
        { from: 13 * 60, to: 18 * 60, class: 'clinic-hours', label: '门诊时间' },
      ],
      schedules: {
        lab: [
          { from: 7 * 60, to: 11 * 60, class: 'doctor-3', label: '化验室|准备' },
          { from: 12 * 60, to: 17 * 60, class: 'doctor-3', label: '化验室|检测' },
        ],
      },
    },
    thu: { default: { from: 8 * 60, to: 18 * 60, class: 'clinic-hours', label: '门诊时间' } },
    fri: {
      default: { from: 8 * 60, to: 16 * 60, class: 'clinic-hours', label: '提前关门' },
      schedules: {
        'dr-kim': { from: 12 * 60, to: 20 * 60, class: 'doctor-2', label: '金医生|扩展班' },
      },
    },
  };
  const scheduleSpecialHours = (() => {
    if (scheduleHoursMode === 'none') return {};
    if (scheduleHoursMode === 'shared') return sharedHours;
    return perScheduleHours;
  })();
  const blockedHours = {
    wed: [
      { from: 9 * 60, to: 12 * 60, class: 'open-hours', label: '开放' },
      {
        from: 12 * 60,
        to: 13 * 60,
        class: 'lunch-break',
        allowEvents: false,
        label: '午餐休息|(不可预约)',
      },
      { from: 13 * 60, to: 18 * 60, class: 'open-hours', label: '开放' },
    ],
  };
  const blockedEvents = [
    {
      start: '2026-06-17 10:00',
      end: '2026-06-17 11:00',
      title: '尝试拖到此事件靠近午餐时段',
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
  ];
  function ReuseSpecialHoursLabel({
    range,
  }: {
    range: { label?: string; class?: string; style?: Record<string, string> };
  }) {
    return (
      <>
        {(range.label ?? '').includes('|') ? (
          <>
            <strong data-v-62e2b63f="">{formatValue((range.label ?? '').split('|')[0])}</strong>
            {(range.label ?? '').split('|')[1].startsWith('(') ? (
              <>{formatValue(' ' + (range.label ?? '').split('|')[1])}</>
            ) : (
              <>
                <br data-v-62e2b63f="" />
                <em data-v-62e2b63f="">{formatValue((range.label ?? '').split('|')[1])}</em>
              </>
            )}
          </>
        ) : (
          <>{formatValue(range.label)}</>
        )}
      </>
    );
  }
  return (
    <>
      <section data-v-62e2b63f="" className={'sd:mb-8'}>
        <h3 data-v-62e2b63f="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'特殊时段 / 营业时间'}
        </h3>
        <p data-v-62e2b63f="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          <code data-v-62e2b63f="">{'special-hours'}</code>
          {
            ' 属性用于在日视图和周视图中高亮指定的时间段。每个星期几可定义一个或多个时间区间， 支持 '
          }
          <code data-v-62e2b63f="">{'label'}</code>
          {'（显示标签）和 '}
          <code data-v-62e2b63f="">{'class'}</code>
          {'（CSS 样式控制）。 '}
        </p>
        <div data-v-62e2b63f="" className={'sd:mb-3 sd:flex sd:items-center sd:gap-2'}>
          <span data-v-62e2b63f="" className={'sd:text-sm'}>
            {'演示模式：'}
          </span>
          <Select
            data-v-62e2b63f=""
            value={hoursVariant}
            onValueChange={(next) => setHoursVariant(next as typeof hoursVariant)}
            size={'small'}
            className={'sd:w-40'}
            options={hoursVariantOptions}
          />
        </div>
        <Calendar
          data-v-62e2b63f=""
          specialHours={currentSpecialHours}
          views={['day', 'week']}
          timeFrom={7 * 60}
          timeTo={20 * 60}
          events={specialHoursEvents}
          editableEvents={true}
          style={{ height: '540px' }}
          renderSpecialHoursLabel={({ range }) => (
            <>
              <ReuseSpecialHoursLabel data-v-62e2b63f="" range={range} />
            </>
          )}
        />
      </section>
      <section data-v-62e2b63f="" className={'sd:mb-8'}>
        <h3 data-v-62e2b63f="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'排班 (Schedules)'}
        </h3>
        <p data-v-62e2b63f="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          <code data-v-62e2b63f="">{'schedules'}</code>
          {' 将一天拆分为多个资源列（如人员、房间），事件通过 '}
          <code data-v-62e2b63f="">{'schedule'}</code>
          {' 属性指定所属列。 '}
          <code data-v-62e2b63f="">{'special-hours'}</code>
          {' 可与排班结合，通过 '}
          <code data-v-62e2b63f="">{'default'}</code>
          {' 和 '}
          <code data-v-62e2b63f="">{'schedules'}</code>
          {' 分别定义共用和按列的时段。 '}
        </p>
        <div data-v-62e2b63f="" className={'sd:flex sd:flex-wrap sd:gap-3 sd:mb-3 sd:items-center'}>
          <span data-v-62e2b63f="" className={'sd:text-sm'}>
            {'排班时段：'}
          </span>
          <Select
            data-v-62e2b63f=""
            value={scheduleHoursMode}
            onValueChange={(next) => setScheduleHoursMode(next as typeof scheduleHoursMode)}
            size={'small'}
            className={'sd:w-40'}
            options={scheduleHoursModeOptions}
          />
        </div>
        <Calendar
          data-v-62e2b63f=""
          viewDate={'2026-06-15'}
          views={['day', 'week']}
          timeFrom={7 * 60}
          timeTo={21 * 60}
          editableEvents={true}
          events={scheduleEvts}
          schedules={scheds}
          specialHours={scheduleSpecialHours}
          style={
            {
              'height': '620px',
              '--sd-calendar-min-cell-size': '24rem',
              '--sd-calendar-min-schedule-size': '13rem',
            } as CSSProperties
          }
          renderSpecialHoursLabel={({ range }) => (
            <>
              <ReuseSpecialHoursLabel data-v-62e2b63f="" range={range} />
            </>
          )}
        />
      </section>
      <section data-v-62e2b63f="" className={'sd:mb-8'}>
        <h3 data-v-62e2b63f="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'阻止时间段 (allowEvents)'}
        </h3>
        <p data-v-62e2b63f="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 在 '}
          <code data-v-62e2b63f="">{'special-hours'}</code>
          {' 的时间块上设置 '}
          <code data-v-62e2b63f="">{'allowEvents: false'}</code>
          {' 可阻止该时间段内的事件创建/拖入/缩放。 适合午餐时间、休息时间等不可预约时段。 '}
        </p>
        <Calendar
          data-v-62e2b63f=""
          views={['week']}
          timeFrom={7 * 60}
          timeTo={20 * 60}
          view={'week'}
          editableEvents={true}
          specialHours={blockedHours}
          events={blockedEvents}
          style={{ height: '400px' }}
          renderSpecialHoursLabel={({ range }) => (
            <>
              <ReuseSpecialHoursLabel data-v-62e2b63f="" range={range} />
            </>
          )}
        />
      </section>
      <style>
        {
          '\n  /* 特殊时段 */\n.sd-calendar__special-hours.business-hours {\n    background-color: rgba(0, 218, 255, 0.13);\n}\n.sd-calendar__special-hours.doctor-1 {\n    background-color: hsl(127, 43%, 60%, 0.15);\n    color: hsl(127, 50%, 40%);\n    text-align: center;\n}\n.sd-calendar__special-hours.doctor-2 {\n    background-color: hsl(217, 43%, 60%, 0.15);\n    color: hsl(217, 80%, 40%);\n    text-align: center;\n}\n.sd-calendar__special-hours.doctor-3 {\n    background-color: hsl(287, 43%, 60%, 0.15);\n    color: hsl(287, 80%, 40%);\n    text-align: center;\n}\n.sd-calendar__special-hours.closed {\n    background: repeating-linear-gradient(\n      -45deg,\n      transparent,\n      transparent 6px,\n      rgba(255, 162, 87, 0.15) 6px,\n      rgba(255, 162, 87, 0.15) 20px\n    );\n    color: hsl(27, 90%, 40%);\n    text-align: center;\n}\n.sd-calendar__special-hours em {\n    font-size: 0.85em;\n    opacity: 0.7;\n}\n\n  /* 排班 */\n.sd-calendar__schedule.doctor--lee {\n    background-color: rgba(192, 235, 255, 0.32);\n}\n.sd-calendar__schedule.doctor--kim {\n    background-color: rgba(255, 221, 235, 0.28);\n}\n.sd-calendar__schedule.doctor--lab {\n    background-color: rgba(222, 255, 229, 0.28);\n}\n.sd-calendar__schedule--heading {\n    font-size: 14px;\n    font-weight: 600;\n}\n.sd-calendar__special-hours.clinic-hours {\n    background-color: rgba(255, 235, 59, 0.18);\n}\n.sd-calendar__special-hours em {\n    font-size: 0.82em;\n    opacity: 0.6;\n}\n\n  /* 事件 */\n.s-event-health {\n    background-color: rgba(87, 206, 169, 0.82);\n    border-color: rgba(76, 175, 80, 0.45);\n    color: #fff;\n}\n.s-event-leisure {\n    background-color: rgba(253, 156, 66, 0.85);\n    border-color: rgba(233, 136, 46, 0.55);\n    color: #fff;\n}\n\n  /* 阻止时段 */\n.open-hours {\n    background-color: rgba(76, 175, 80, 0.15);\n}\n.lunch-break {\n    background: repeating-linear-gradient(\n      -45deg,\n      transparent,\n      transparent 5px,\n      rgba(0, 0, 0, 0.06) 5px,\n      rgba(0, 0, 0, 0.06) 12px\n    );\n    color: rgba(0, 0, 0, 0.55);\n    text-align: center;\n}\n'
        }
      </style>
    </>
  );
}
