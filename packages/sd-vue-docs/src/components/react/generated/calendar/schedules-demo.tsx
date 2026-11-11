/** @jsxImportSource react */
import { Button, Calendar, Checkbox, Select } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const today = new Date();
  const [currentView, setCurrentView] =
    useState<NonNullable<ComponentProps<typeof Calendar>['view']>>('week');
  const [useCustomTitle, setUseCustomTitle] = useState(false);
  const [useCustomButtons, setUseCustomButtons] = useState(false);
  const [useCustomWeekdayHeadings, setUseCustomWeekdayHeadings] = useState(false);
  const [useCustomTodayBtn, setUseCustomTodayBtn] = useState(false);
  const [useCustomHeader, setUseCustomHeader] = useState(false);
  const [titleView, setTitleView] =
    useState<NonNullable<ComponentProps<typeof Calendar>['view']>>('day');
  const viewOptions = ['day', 'days', 'week', 'month', 'year', 'years'];
  const viewLabels: Record<string, string> = {
    day: '日',
    days: '多日',
    week: '周',
    month: '月',
    year: '年',
    years: '多年',
  };
  const titleViewOptions = viewOptions.map((v) => ({ value: v, label: viewLabels[v] }));
  const demoEvents = [
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 12, 0),
      title: '高尔夫球',
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
      title: '购物',
      backgroundColor: '#10b981',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0),
      title: '团队建设',
      backgroundColor: '#f59e0b',
      color: '#fff',
    },
  ];
  const customRenderEvents = [
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 9, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 12, 0),
      title: '产品规划会议',
      backgroundColor: '#3b82f6',
      color: '#fff',
      location: '3F-会议室A',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 16, 0),
      title: '设计走查',
      backgroundColor: '#10b981',
      color: '#fff',
      location: '线上',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 12, 0),
      title: '开发同步会',
      backgroundColor: '#f59e0b',
      color: '#fff',
      location: '5F-开放区',
    },
  ];
  const scheduleList = [
    { label: '张三', color: '#3b82f6', class: 'schedule1' },
    { label: '李四', color: '#10b981', class: 'schedule2' },
    { label: '王五', color: '#f59e0b', class: 'schedule3' },
    { label: '赵六', color: '#ef4444', class: 'schedule4' },
  ];
  const scheduleEvents = [
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      title: '早会',
      backgroundColor: '#3b82f6',
      color: '#fff',
      schedule: 0,
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
      title: '设计讨论',
      backgroundColor: '#10b981',
      color: '#fff',
      schedule: 1,
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0),
      title: '客户评审',
      backgroundColor: '#f59e0b',
      color: '#fff',
      schedule: 2,
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0),
      title: '代码评审',
      backgroundColor: '#ef4444',
      color: '#fff',
      schedule: 3,
    },
  ];
  const richEvents = Array.from({ length: 15 }, (_, i) => ({
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + (i % 7),
      9 + (i % 6),
      0,
    ),
    end: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + (i % 7),
      10 + (i % 6),
      0,
    ),
    title: `日程 ${i + 1}`,
    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][i % 5],
    color: '#fff',
  }));

  return (
    <>
      <section data-v-2ec44646="" className={'sd:mb-8'}>
        <h3 data-v-2ec44646="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'常用插槽概览'}
        </h3>
        <p data-v-2ec44646="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 日历提供了丰富的插槽系统，可深入定制各个部分的渲染。以下展示了最常用的插槽效果： '}
        </p>
        <div data-v-2ec44646="" className={'sd:flex sd:flex-wrap sd:gap-2 sd:mb-3'}>
          <Checkbox
            data-v-2ec44646=""
            modelValue={useCustomTitle}
            onValueChange={(next) => setUseCustomTitle(next as typeof useCustomTitle)}
          >
            {'自定义标题'}
          </Checkbox>
          <Checkbox
            data-v-2ec44646=""
            modelValue={useCustomButtons}
            onValueChange={(next) => setUseCustomButtons(next as typeof useCustomButtons)}
          >
            {'自定义按钮'}
          </Checkbox>
          <Checkbox
            data-v-2ec44646=""
            modelValue={useCustomWeekdayHeadings}
            onValueChange={(next) =>
              setUseCustomWeekdayHeadings(next as typeof useCustomWeekdayHeadings)
            }
          >
            {'自定义星期标题'}
          </Checkbox>
          <Checkbox
            data-v-2ec44646=""
            modelValue={useCustomTodayBtn}
            onValueChange={(next) => setUseCustomTodayBtn(next as typeof useCustomTodayBtn)}
          >
            {'自定义今天按钮'}
          </Checkbox>
          <Checkbox
            data-v-2ec44646=""
            modelValue={useCustomHeader}
            onValueChange={(next) => setUseCustomHeader(next as typeof useCustomHeader)}
          >
            {'自定义完整头部'}
          </Checkbox>
        </div>
        <Calendar
          data-v-2ec44646=""
          view={currentView}
          onUpdateView={(next) => setCurrentView(next as typeof currentView)}
          timeFrom={9 * 60}
          timeTo={15 * 60}
          events={demoEvents}
          style={{ height: '400px' }}
          renderTitle={({ title }) => (
            <>
              <code data-v-2ec44646="" style={{ color: '#f59e0b' }}>
                {formatValue(title)}
              </code>
            </>
          )}
          previousButton={
            <>
              <span
                data-v-2ec44646=""
                style={{
                  color: '#3b82f6',
                  fontSize: '18px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {'⬅'}
              </span>
            </>
          }
          nextButton={
            <>
              <span
                data-v-2ec44646=""
                style={{
                  color: '#3b82f6',
                  fontSize: '18px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {'➡'}
              </span>
            </>
          }
          renderWeekdayHeading={({ label }) => (
            <>
              <strong data-v-2ec44646="" style={{ color: '#f59e0b' }}>
                {formatValue(label)}
              </strong>
            </>
          )}
          renderTodayButton={({ navigate, active }) => (
            <>
              <Button
                data-v-2ec44646=""
                disabled={active}
                onClick={navigate}
                size={'small'}
                type={'outline'}
              >
                {' 📅 今天 '}
              </Button>
            </>
          )}
          renderHeader={({ view, availableViews }) => (
            <>
              <div
                data-v-2ec44646=""
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  padding: '4px 8px',
                  background: '#ffedd5',
                }}
              >
                <Button data-v-2ec44646="" size={'small'} onClick={view.previous}>
                  {'◀'}
                </Button>
                <span data-v-2ec44646="" style={{ color: '#c2410c', fontWeight: 'bold' }}>
                  {formatValue(view.title)}
                </span>
                <Button data-v-2ec44646="" size={'small'} onClick={view.next}>
                  {'▶'}
                </Button>
                <div data-v-2ec44646="" style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                  {Object.entries(availableViews).map(([viewId, grid]) => (
                    <Button
                      data-v-2ec44646=""
                      key={viewId}
                      size={'small'}
                      type={view.id === viewId ? 'primary' : 'outline'}
                      onClick={() => {
                        setCurrentView(String(viewId));
                      }}
                    >
                      {formatValue(viewId)}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        />
      </section>
      <section data-v-2ec44646="" className={'sd:mb-8'}>
        <h3 data-v-2ec44646="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'按视图自定义标题'}
        </h3>
        <p data-v-2ec44646="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 使用具名插槽 '}
          <code data-v-2ec44646="">{'#title.week'}</code>
          {'、'}
          <code data-v-2ec44646="">{'#title.month'}</code>
          {' 等按不同视图分别定义标题格式。 '}
        </p>
        <div data-v-2ec44646="" className={'sd:mb-3 sd:flex sd:items-center sd:gap-2'}>
          <Select
            data-v-2ec44646=""
            value={titleView}
            onValueChange={(next) => setTitleView(next as typeof titleView)}
            size={'small'}
            className={'sd:w-32'}
            options={titleViewOptions}
          />
          <span data-v-2ec44646="" className={'sd:text-sm sd:text-gray-500'}>
            {'— 根据此视图自定义标题'}
          </span>
        </div>
        <Calendar
          data-v-2ec44646=""
          view={titleView}
          style={{ height: '380px' }}
          renderViewTitle={Object.fromEntries(
            viewOptions.map((v) => [
              v,
              (view) => <>{formatValue(v === titleView ? `📌 ${view.title} ❤️` : '')}</>,
            ]),
          )}
        />
      </section>
      <section data-v-2ec44646="" className={'sd:mb-8'}>
        <h3 data-v-2ec44646="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'自定义事件渲染'}
        </h3>
        <p data-v-2ec44646="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code data-v-2ec44646="">{'#event'}</code>
          {' 插槽完全接管事件卡片的渲染，插槽参数 '}
          <code data-v-2ec44646="">{'{ event }'}</code>
          {' 包含事件所有数据， '}
          <code data-v-2ec44646="">{'event._'}</code>
          {' 提供格式化后的时间等元信息。另有 '}
          <code data-v-2ec44646="">{'#event.day'}</code>
          {'、'}
          <code data-v-2ec44646="">{'#event.month'}</code>
          {' 等按视图的变体。 '}
        </p>
        <Calendar
          data-v-2ec44646=""
          events={customRenderEvents}
          timeFrom={9 * 60}
          timeTo={18 * 60}
          view={'week'}
          viewsBar={false}
          style={{ height: '420px' }}
          renderEvent={(event) => (
            <>
              <div
                data-v-2ec44646=""
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderLeft: '4px solid ' + (event.backgroundColor || '#3b82f6'),
                  background: (event.backgroundColor || '#3b82f6') + '22',
                }}
              >
                <div data-v-2ec44646="" style={{ marginBottom: '2px', fontWeight: '600' }}>
                  {formatValue(event.title)}
                </div>
                <div data-v-2ec44646="" style={{ fontSize: '11px', opacity: '0.7' }}>
                  {formatValue(event._.startTimeFormatted24)}
                  {' — '}
                  {formatValue(event._.endTimeFormatted24)}
                </div>
                {event.location ? (
                  <div data-v-2ec44646="" style={{ fontSize: '11px', opacity: '0.6' }}>
                    {' 📍 '}
                    {formatValue(event.location)}
                  </div>
                ) : null}
              </div>
            </>
          )}
        />
      </section>
      <section data-v-2ec44646="" className={'sd:mb-8'}>
        <h3 data-v-2ec44646="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'自定义排班标题'}
        </h3>
        <p data-v-2ec44646="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code data-v-2ec44646="">{'#schedule-heading'}</code>
          {' 插槽自定义排班列的标题，插槽参数 '}
          <code data-v-2ec44646="">{'{ schedule }'}</code>
          {' 包含排班定义信息。 '}
        </p>
        <Calendar
          data-v-2ec44646=""
          views={['day', 'week']}
          view={'day'}
          schedules={scheduleList}
          events={scheduleEvents}
          hideWeekdays={['sat', 'sun']}
          style={{ height: '420px' }}
          renderScheduleHeading={({ schedule }) => (
            <>
              <div data-v-2ec44646="" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span
                  data-v-2ec44646=""
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: schedule.color || '#999',
                  }}
                />
                <strong data-v-2ec44646="" style={{ color: schedule.color }}>
                  {formatValue(schedule.label)}
                </strong>
              </div>
            </>
          )}
        />
      </section>
      <section data-v-2ec44646="" className={'sd:mb-8'}>
        <h3 data-v-2ec44646="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'自定义单元格内容'}
        </h3>
        <p data-v-2ec44646="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code data-v-2ec44646="">{'#cell-content'}</code>
          {' 插槽自定义单元格内容和交互，插槽参数：'}
          <code data-v-2ec44646="">{'{ cell, view, events, goNarrower }'}</code>
          {'。 '}
        </p>
        <Calendar
          data-v-2ec44646=""
          time={false}
          view={'month'}
          events={richEvents}
          style={{ height: '480px' }}
          renderCellDate={({ cell, view }) => (
            <>
              {view.id === 'day' || view.id === 'week' || view.id === 'month' ? (
                <span
                  data-v-2ec44646=""
                  onClick={cell.goNarrower}
                  style={{
                    cursor: 'pointer',
                    fontWeight: cell.today ? '700' : '400',
                    color: cell.today ? '#3b82f6' : 'inherit',
                  }}
                >
                  {formatValue(cell.content)}
                </span>
              ) : null}
            </>
          )}
        />
      </section>
      <style>
        {
          '\n  /* 自定义排班列配色 */\n.sd-calendar__schedule.schedule1 {\n    background-color: rgb(59 130 246 / 12%);\n}\n.sd-calendar__schedule.schedule2 {\n    background-color: rgb(16 185 129 / 12%);\n}\n.sd-calendar__schedule.schedule3 {\n    background-color: rgb(245 158 11 / 12%);\n}\n.sd-calendar__schedule.schedule4 {\n    background-color: rgb(239 68 68 / 12%);\n}\n.sd-calendar__schedule--heading {\n    font-weight: 600;\n    font-size: 13px;\n}\n'
        }
      </style>
    </>
  );
}
