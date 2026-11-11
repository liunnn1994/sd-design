/** @jsxImportSource react */
import { Calendar, Checkbox } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const today = new Date();
  const [showBgEvents, setShowBgEvents] = useState(false);
  const allBgEvents = [
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 9, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 10, 0),
      title: '医生预约',
      class: 'event-health',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
      title: '牙科检查',
      class: 'event-health',
      backgroundColor: '#57cea9cc',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
      title: '团队午餐',
      class: 'event-lunch',
      background: true,
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 13, 0),
      title: '萨尔萨舞蹈课',
      class: 'event-sport',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 12, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 14, 0),
      title: '午餐',
      background: true,
      class: 'event-lunch',
    },
  ];
  const filteredBgEvents = (() =>
    showBgEvents ? allBgEvents : allBgEvents.filter((e) => !e.background))();
  const timelessEvents = [
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      title: '舞蹈课',
      backgroundColor: '#ff6666d9',
      color: '#fff',
      class: 'event-sport',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      title: '高尔夫球',
      backgroundColor: '#fd9c42d9',
      color: '#fff',
      class: 'event-leisure',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      title: '购物',
      backgroundColor: '#57cea9cc',
      color: '#fff',
      class: 'event-health',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      title: '医生预约',
      backgroundColor: '#3b82f6cc',
      color: '#fff',
    },
  ];
  const [showAllDayBar, setShowAllDayBar] = useState(true);
  const [allDayOn, setAllDayOn] = useState(true);
  const allDayEvents = (() => [
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate())
        .toISOString()
        .slice(0, 10),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        .toISOString()
        .slice(0, 10),
      allDay: allDayOn,
      title: '休假! 🎉',
      class: 'event-yellow',
      backgroundColor: '#ffc85abf',
      color: '#222',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        .toISOString()
        .slice(0, 10),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)
        .toISOString()
        .slice(0, 10),
      allDay: allDayOn,
      title: '纪念日 ❤️',
      class: 'event-pink',
      backgroundColor: '#ff3a8fb3',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 30),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 30),
      title: '牙科预约',
      backgroundColor: '#57cea9cc',
      color: '#fff',
      class: 'event-health',
    },
  ])();
  const [showEventsOnMonth, setShowEventsOnMonth] = useState(true);
  const [showEventCount, setShowEventCount] = useState(false);
  const richEvents = Array.from({ length: 20 }, (_, i) => ({
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + (i % 5),
      8 + (i % 6),
      0,
    ),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + (i % 5), 9 + (i % 6), 0),
    title: `事件 ${i + 1}`,
    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][i % 5],
    color: '#fff',
    class: ['event-meeting', 'event-leisure', 'event-health', 'event-sport', 'event-pink'][i % 5],
  }));
  const [stackEvents, setStackEvents] = useState(false);
  const overlappingEvents = [
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      title: '大型评审会',
      class: 'event-health',
      backgroundColor: '#57cea9cc',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      title: '项目讨论',
      class: 'event-meeting',
      backgroundColor: '#64c8ffcc',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      title: '方案评审',
      class: 'event-sport',
      backgroundColor: '#ff6666d9',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 13, 0),
      title: '客户电话',
      class: 'event-meeting',
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
      title: '设计评审',
      class: 'event-yellow',
      backgroundColor: '#ffc85abf',
      color: '#222',
    },
  ];
  const multiDayEvents = [
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 12, 0),
      title: '马拉松比赛',
      class: 'event-sport',
      backgroundColor: 'rgba(255, 185, 185, 0.8)',
      color: '#c55656',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 25),
      title: '喝水！',
      class: 'event-health',
      backgroundColor: 'rgba(200, 248, 233, 0.8)',
      color: '#219671',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 8, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 21, 0),
      title: '印度之旅',
      class: 'event-leisure',
      backgroundColor: 'rgba(255, 202, 154, 0.8)',
      color: '#b57335',
    },
  ];

  return (
    <>
      <section data-v-8f216385="" className={'sd:mb-8'}>
        <h3 data-v-8f216385="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'基础事件与背景事件'}
        </h3>
        <p data-v-8f216385="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 事件由 '}
          <code data-v-8f216385="">{'start'}</code>
          {' 和 '}
          <code data-v-8f216385="">{'end'}</code>
          {' 定义，可附加 '}
          <code data-v-8f216385="">{'title'}</code>
          {'、'}
          <code data-v-8f216385="">{'class'}</code>
          {'、'}
          <code data-v-8f216385="">{'backgroundColor'}</code>
          {'、'}
          <code data-v-8f216385="">{'color'}</code>
          {' 等属性并配合 CSS 定制外观。设置 '}
          <code data-v-8f216385="">{'background: true'}</code>
          {' 可将事件降为背景层，不会与其他事件产生重叠推挤。 '}
        </p>
        <div data-v-8f216385="" className={'sd:mb-3'}>
          <Checkbox
            data-v-8f216385=""
            modelValue={showBgEvents}
            onValueChange={(next) => setShowBgEvents(next as typeof showBgEvents)}
          >
            {'显示背景事件（午餐时间）'}
          </Checkbox>
        </div>
        <Calendar
          data-v-8f216385=""
          events={filteredBgEvents}
          timeFrom={9 * 60}
          timeTo={15 * 60}
          views={{ days: { cols: 5, rows: 1 } }}
          view={'days'}
          viewsBar={false}
          style={{ height: '320px' }}
        />
      </section>
      <section data-v-8f216385="" className={'sd:mb-8'}>
        <h3 data-v-8f216385="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'不计时事件 (Timeless Events)'}
        </h3>
        <p data-v-8f216385="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 当 '}
          <code data-v-8f216385="">{':time="false"'}</code>
          {' 时，日历事件不显示时间轴，事件无法调整大小，仅按天展示。 '}
        </p>
        <Calendar
          data-v-8f216385=""
          time={false}
          events={timelessEvents}
          views={{ days: { cols: 5, rows: 1 } }}
          view={'days'}
          viewsBar={false}
          style={{ height: '240px' }}
        />
      </section>
      <section data-v-8f216385="" className={'sd:mb-8'}>
        <h3 data-v-8f216385="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'全天事件'}
        </h3>
        <p data-v-8f216385="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 设置 '}
          <code data-v-8f216385="">{'allDay: true'}</code>
          {' 可将事件标记为全天事件。开启 '}
          <code data-v-8f216385="">{'all-day-events'}</code>
          {' 后，全天事件会显示在固定顶部栏中。 '}
        </p>
        <div data-v-8f216385="" className={'sd:flex sd:flex-wrap sd:gap-3 sd:mb-3'}>
          <Checkbox
            data-v-8f216385=""
            modelValue={showAllDayBar}
            onValueChange={(next) => setShowAllDayBar(next as typeof showAllDayBar)}
          >
            {'显示全天事件栏'}
          </Checkbox>
          <Checkbox
            data-v-8f216385=""
            modelValue={allDayOn}
            onValueChange={(next) => setAllDayOn(next as typeof allDayOn)}
          >
            {'事件标记为全天'}
          </Checkbox>
        </div>
        <Calendar
          data-v-8f216385=""
          allDayEvents={showAllDayBar}
          events={allDayEvents}
          timeFrom={7 * 60}
          timeTo={19 * 60}
          view={'week'}
          views={{ day: {}, week: {}, month: {} }}
          style={{ height: '420px' }}
        />
      </section>
      <section data-v-8f216385="" className={'sd:mb-8'}>
        <h3 data-v-8f216385="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'月视图事件与事件计数'}
        </h3>
        <p data-v-8f216385="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code data-v-8f216385="">{'events-on-month-view'}</code>
          {' 在月视图中显示完整事件；通过 '}
          <code data-v-8f216385="">{'event-count'}</code>
          {' 显示每格的事件计数。 '}
        </p>
        <div data-v-8f216385="" className={'sd:flex sd:flex-wrap sd:gap-3 sd:mb-3'}>
          <Checkbox
            data-v-8f216385=""
            modelValue={showEventsOnMonth}
            onValueChange={(next) => setShowEventsOnMonth(next as typeof showEventsOnMonth)}
          >
            {'月视图显示事件'}
          </Checkbox>
          <Checkbox
            data-v-8f216385=""
            modelValue={showEventCount}
            onValueChange={(next) => setShowEventCount(next as typeof showEventCount)}
          >
            {'显示事件计数'}
          </Checkbox>
        </div>
        <Calendar
          data-v-8f216385=""
          eventsOnMonthView={showEventsOnMonth}
          eventCount={showEventCount}
          events={richEvents}
          views={{ days: { cols: 5, rows: 1 }, month: {} }}
          view={'month'}
          style={{ height: '500px' }}
        />
      </section>
      <section data-v-8f216385="" className={'sd:mb-8'}>
        <h3 data-v-8f216385="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'重叠事件堆叠'}
        </h3>
        <p data-v-8f216385="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 开启 '}
          <code data-v-8f216385="">{'stack-events'}</code>
          {' 时，若多个事件在时间上重叠，它们将堆叠展示而非互相挤压，各事件自动获得 '}
          <code data-v-8f216385="">{'.sd-calendar__event--stack-N-M'}</code>
          {' 类名。 '}
        </p>
        <div data-v-8f216385="" className={'sd:mb-3'}>
          <Checkbox
            data-v-8f216385=""
            modelValue={stackEvents}
            onValueChange={(next) => setStackEvents(next as typeof stackEvents)}
          >
            {'堆叠事件'}
          </Checkbox>
        </div>
        <Calendar
          data-v-8f216385=""
          stackEvents={stackEvents}
          events={overlappingEvents}
          timeFrom={9 * 60}
          timeTo={16 * 60}
          views={{ days: { cols: 5, rows: 1 } }}
          view={'days'}
          viewsBar={false}
          editableEvents={true}
          style={{ height: '380px' }}
        />
      </section>
      <section data-v-8f216385="" className={'sd:mb-8'}>
        <h3 data-v-8f216385="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'多天事件'}
        </h3>
        <p data-v-8f216385="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 事件的 '}
          <code data-v-8f216385="">{'start'}</code>
          {' 和 '}
          <code data-v-8f216385="">{'end'}</code>
          {' 跨越不同日期时自动成为多天事件，可拖拽调整时长和水平调整天数。'}
          <code data-v-8f216385="">{'editable-events="{ resizeX: true }"'}</code>
          {' 开启水平调整。 '}
        </p>
        <Calendar
          data-v-8f216385=""
          events={multiDayEvents}
          timeFrom={8 * 60}
          timeTo={23 * 60}
          views={{ day: {}, days: { cols: 5, rows: 1 }, week: {}, month: {} }}
          view={'week'}
          editableEvents={{ resizeX: true }}
          hideWeekends={true}
          style={{ height: '480px' }}
        />
      </section>
      <style>
        {
          '\n.sd-calendar__event.event-health {\n    background-color: #57cea9cc;\n    border-color: #90d2be;\n    color: #fff;\n}\n.sd-calendar__event.event-sport {\n    background-color: #ff6666d9;\n    border-color: #eb5252;\n    color: #fff;\n}\n.sd-calendar__event.event-leisure {\n    background-color: #fd9c42d9;\n    border-color: #e9882e;\n    color: #fff;\n}\n.sd-calendar__event.event-meeting {\n    background-color: #64c8ffcc;\n    border-color: #50b4eb;\n    color: #fff;\n}\n.sd-calendar__event.event-pink {\n    background-color: #ff3a8fb3;\n    border-color: #eb267b;\n    color: #fff;\n}\n.sd-calendar__event.event-yellow {\n    background-color: #ffc85abf;\n    border-color: #ffc356;\n}\n.sd-calendar__event.event-lunch {\n    background: repeating-linear-gradient(\n      45deg,\n      transparent,\n      transparent 10px,\n      rgba(0, 0, 0, 0.04) 10px,\n      rgba(0, 0, 0, 0.04) 20px\n    );\n    border: none;\n    color: #666;\n}\n'
        }
      </style>
    </>
  );
}
