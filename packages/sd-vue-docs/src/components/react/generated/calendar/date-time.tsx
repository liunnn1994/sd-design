/** @jsxImportSource react */
import { Calendar, Checkbox, Slider } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [timeFrom, setTimeFrom] = useState(7);
  const [timeTo, setTimeTo] = useState(18);
  const [timeStep, setTimeStep] = useState(60);
  const [watchRealTime, setWatchRealTime] = useState(false);
  const today = new Date();
  const minDate = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 10);
    return d.toISOString().slice(0, 10);
  })();
  const maxDate = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 10);
    return d.toISOString().slice(0, 10);
  })();
  const disabledDates = (() => {
    const d = new Date(today);
    return [
      new Date(d.getFullYear(), d.getMonth(), d.getDate() - 2).toISOString().slice(0, 10),
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10),
      new Date(d.getFullYear(), d.getMonth(), d.getDate() + 2).toISOString().slice(0, 10),
    ];
  })();
  const [hiddenWeekdays, setHiddenWeekdays] = useState(['sat', 'sun']);
  const weekdays = [
    { label: '周一', value: 'mon' },
    { label: '周二', value: 'tue' },
    { label: '周三', value: 'wed' },
    { label: '周四', value: 'thu' },
    { label: '周五', value: 'fri' },
    { label: '周六', value: 'sat' },
    { label: '周日', value: 'sun' },
  ];
  const [useTwelveHour, setUseTwelveHour] = useState(false);
  const demoEvents = [
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 9, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 11, 0),
      title: '产品需求评审',
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
      title: '技术讨论',
      backgroundColor: '#10b981',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0),
      title: '跨团队同步',
      backgroundColor: '#f59e0b',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 30),
      title: '用户调研',
      backgroundColor: '#8b5cf6',
      color: '#fff',
    },
  ];

  return (
    <>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'时间轴范围与步长'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code>{'time-from'}</code>
          {'、'}
          <code>{'time-to'}</code>
          {'、'}
          <code>{'time-step'}</code>
          {' 控制时间轴显示范围与刻度间隔（单位均为分钟）。 '}
        </p>
        <div className={'sd:flex sd:flex-wrap sd:gap-4 sd:mb-3 sd:items-end'}>
          <div className={'sd:flex-1 sd:min-w-[140px]'}>
            <label className={'sd:text-xs sd:text-gray-500 sd:block sd:mb-1'}>
              {'起始时刻: '}
              {formatValue(timeFrom)}
              {':00'}
            </label>
            <Slider
              value={timeFrom}
              onValueChange={(next) => setTimeFrom(next as typeof timeFrom)}
              min={0}
              max={12}
              step={1}
            />
          </div>
          <div className={'sd:flex-1 sd:min-w-[140px]'}>
            <label className={'sd:text-xs sd:text-gray-500 sd:block sd:mb-1'}>
              {'结束时刻: '}
              {formatValue(timeTo)}
              {':00'}
            </label>
            <Slider
              value={timeTo}
              onValueChange={(next) => setTimeTo(next as typeof timeTo)}
              min={12}
              max={24}
              step={1}
            />
          </div>
          <div className={'sd:flex-1 sd:min-w-[140px]'}>
            <label className={'sd:text-xs sd:text-gray-500 sd:block sd:mb-1'}>
              {'刻度间隔: '}
              {formatValue(timeStep)}
              {' 分钟'}
            </label>
            <Slider
              value={timeStep}
              onValueChange={(next) => setTimeStep(next as typeof timeStep)}
              min={10}
              max={120}
              step={10}
            />
          </div>
        </div>
        <Calendar
          timeFrom={timeFrom * 60}
          timeTo={timeTo * 60}
          timeStep={timeStep}
          views={{ day: {}, days: { cols: 5, rows: 1 }, week: {} }}
          view={'days'}
          events={demoEvents}
          style={{ height: '380px' }}
        />
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'当前时间线'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 当时间轴可见时，今天的当前时间会以一条线标记。通过 '}
          <code>{'watch-real-time'}</code>
          {' 可实时更新该时间线位置。 '}
        </p>
        <div className={'sd:mb-3'}>
          <Checkbox
            modelValue={watchRealTime}
            onValueChange={(next) => setWatchRealTime(next as typeof watchRealTime)}
          >
            {'实时跟踪时间'}
          </Checkbox>
        </div>
        <Calendar
          views={['day']}
          view={'day'}
          viewsBar={false}
          todayButton={false}
          watchRealTime={watchRealTime}
          xs={true}
          style={{ width: '300px', height: '240px' }}
        />
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'最小 / 最大可交互日期'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code>{'min-date'}</code>
          {' 与 '}
          <code>{'max-date'}</code>
          {' 设定可交互的日期范围，超出范围的格子会带有 '}
          <code>{'.before-min'}</code>
          {' / '}
          <code>{'.after-max'}</code>
          {' 类名，便于样式定制。 '}
        </p>
        <Calendar
          clickToNavigate={true}
          datePicker={true}
          viewsBar={false}
          minDate={minDate}
          maxDate={maxDate}
          viewDate={new Date()}
          style={{ width: '300px', height: '380px' }}
        />
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'禁用特定日期'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code>{'disable-days'}</code>
          {' 传入日期数组（'}
          <code>{'YYYY-MM-DD'}</code>
          {' 字符串或 Date 对象），禁用指定日期使其不可选。 '}
        </p>
        <Calendar
          datePicker={true}
          viewsBar={false}
          disableDays={disabledDates}
          viewDate={new Date()}
          style={{ width: '300px', height: '380px' }}
        />
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'隐藏特定星期'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code>{'hide-weekdays'}</code>
          {' 隐藏指定星期列，如隐藏周末或工作日。对 '}
          <code>{'days'}</code>
          {'、'}
          <code>{'week'}</code>
          {'、'}
          <code>{'month'}</code>
          {' 视图均有效。 '}
        </p>
        <div className={'sd:flex sd:flex-wrap sd:gap-2 sd:mb-3'}>
          {weekdays.map((day) => (
            <Checkbox
              key={day.value}
              value={day.value}
              modelValue={hiddenWeekdays}
              onValueChange={(next) => setHiddenWeekdays(next as typeof hiddenWeekdays)}
            >
              {formatValue(day.label)}
            </Checkbox>
          ))}
        </div>
        <Calendar
          hideWeekdays={hiddenWeekdays}
          events={demoEvents}
          timeFrom={8 * 60}
          timeTo={18 * 60}
          viewDate={new Date()}
          style={{ height: '420px' }}
        />
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'十二小时制'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code>{'twelve-hour'}</code>
          {' 将时间显示切换为 12 小时格式（如 9am / 2pm）。 '}
        </p>
        <div className={'sd:mb-3'}>
          <Checkbox
            modelValue={useTwelveHour}
            onValueChange={(next) => setUseTwelveHour(next as typeof useTwelveHour)}
          >
            {'使用 12 小时制'}
          </Checkbox>
        </div>
        <Calendar
          twelveHour={useTwelveHour}
          events={demoEvents}
          timeFrom={8 * 60}
          timeTo={18 * 60}
          viewDate={new Date()}
          style={{ height: '420px' }}
        />
      </section>
    </>
  );
}
