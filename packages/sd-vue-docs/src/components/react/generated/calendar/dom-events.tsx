/** @jsxImportSource react */
import { Button, Calendar, Radio, RadioGroup } from '@sdata/web-react';
import { type ComponentProps, type ComponentRef, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const today = new Date();
  const [logs, setLogs] = useState<Array<{ name: string; args: string }>>([]);
  type LogArg = object;
  const logEvent = (name: string, params: LogArg) => {
    const sanitized: Record<string, unknown> = { ...params };
    if (sanitized.cell) {
      const cell = sanitized.cell as { formattedDate?: string; start: Date };
      sanitized.cell = `[Cell] ${cell.formattedDate || cell.start}`;
    }
    if (sanitized.e) sanitized.e = `[${sanitized.e.constructor.name || 'Event'}]`;
    if (sanitized.event) {
      const ev = sanitized.event as { title?: string };
      sanitized.event = `"${ev.title || 'untitled'}"`;
    }
    const seen = new WeakSet<object>();
    const args = JSON.stringify(
      sanitized,
      (_key, value: unknown) => {
        if (value instanceof Node || value instanceof Event)
          return '[' + value.constructor.name + ']';
        if (value && typeof value === 'object') {
          if (seen.has(value)) return '[Circular]';
          seen.add(value);
        }
        return value;
      },
      2,
    );
    setLogs((previous) => [{ name, args }, ...previous].slice(0, 50));
  };
  const onEventDropLog = (params: LogArg) => {
    logEvent('event-drop', params);
    return true;
  };
  const clearLogs = () => {
    setLogs([]);
  };
  const [loading, setLoading] = useState(false);
  const [backendEvents, setBackendEvents] = useState<
    import('@sdata/web-react').CalendarEventInput[]
  >([]);
  const generateEvents = (start: Date, end: Date) => {
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const evts = [];
    for (let d = 0; d < Math.min(days, 14); d++) {
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const hourStart = Math.floor(Math.random() * 8) + 9;
        const s = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate() + d,
          hourStart,
          Math.floor(Math.random() * 60),
        );
        const e = new Date(s.getTime() + 60 * 60 * 1000);
        evts.push({
          title: `事件 ${evts.length + 1}`,
          start: s,
          end: e,
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][
            Math.floor(Math.random() * 5)
          ],
          color: '#fff',
        });
      }
    }
    return evts;
  };
  const onViewChange = async (view: { start: Date; end: Date }) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setBackendEvents(generateEvents(new Date(view.start), new Date(view.end)));
    setLoading(false);
  };
  const calRef = useRef<ComponentRef<typeof Calendar> | null>(null);
  const [externalView, setExternalView] = useState('month');
  const [externalViewDate, setExternalViewDate] = useState<
    NonNullable<ComponentProps<typeof Calendar>['viewDate']>
  >(new Date());
  const views = ['day', 'week', 'month', 'year', 'years'];
  const [syncedDate, setSyncedDate] = useState<string | Date>(
    new Date().toISOString().slice(0, 10),
  );
  const [syncedViewDate, setSyncedViewDate] = useState<string | Date>(syncedDate);
  const demoEvents = [
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 9, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 11, 0),
      title: '需求评审',
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
      title: '设计评审',
      backgroundColor: '#f59e0b',
      color: '#fff',
    },
  ];

  return (
    <>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'Vue Cal 发出的事件'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 日历发出丰富的事件用于外部联动。下表交互会产生对应的 DOM 事件回调。 '}
        </p>
        <div className={'sd:flex sd:gap-2 sd:mb-3'}>
          <Button size={'small'} onClick={clearLogs}>
            {'清空日志'}
          </Button>
        </div>
        <div
          className={
            'sd:mb-3 sd:rounded sd:border sd:bg-gray-50 sd:p-2 sd:text-xs sd:font-mono sd:overflow-auto'
          }
          style={{ maxHeight: '160px', whiteSpace: 'pre-wrap' }}
        >
          {!logs.length ? (
            <div className={'sd:text-gray-400'}>{'// 与下方日历互动以查看事件日志…'}</div>
          ) : null}
          {logs.map((log, i) => (
            <div key={i} className={'sd:mb-1'}>
              <span style={{ color: '#3b82f6' }}>{formatValue(log.name)}</span>
              {': '}
              {formatValue(log.args)}
            </div>
          ))}
        </div>
        <Calendar
          timeFrom={7 * 60}
          timeTo={23 * 60}
          views={['day', 'week', 'month']}
          editableEvents={true}
          events={demoEvents}
          onReady={($event) => {
            logEvent('ready', $event);
          }}
          onViewChange={($event) => {
            logEvent('view-change', $event);
          }}
          onEventCreate={($event) => {
            logEvent('event-create', $event);
          }}
          onEventClick={($event) => {
            logEvent('event-click', $event);
          }}
          onEventDblclick={($event) => {
            logEvent('event-dblclick', $event);
          }}
          onEventDragStart={($event) => {
            logEvent('event-drag-start', $event);
          }}
          onEventDragEnd={($event) => {
            logEvent('event-drag-end', $event);
          }}
          onEventDrop={onEventDropLog}
          onEventResize={($event) => {
            logEvent('event-resize', $event);
          }}
          onEventDelete={($event) => {
            logEvent('event-delete', $event);
          }}
          onCellClick={($event) => {
            logEvent('cell-click', $event);
          }}
          onCellDblclick={($event) => {
            logEvent('cell-dblclick', $event);
          }}
          onCellHold={($event) => {
            logEvent('cell-hold', $event);
          }}
          style={{ height: '460px' }}
        />
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'从"后端"加载事件'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 监听 '}
          <code>{'@view-change'}</code>
          {' 事件，根据当前视图的 '}
          <code>{'start'}</code>
          {' / '}
          <code>{'end'}</code>
          {' 日期范围，模拟从后端 API 获取并刷新事件列表。 '}
        </p>
        <div className={'sd:mb-3 sd:text-sm'}>
          {loading ? (
            <span className={'sd:text-blue-500'}>{'加载中...'}</span>
          ) : (
            <span className={'sd:text-gray-500'}>
              {formatValue(backendEvents.length)}
              {' 条事件已加载'}
            </span>
          )}
        </div>
        <Calendar
          events={backendEvents}
          timeFrom={9 * 60}
          timeTo={18 * 60}
          viewsBar={false}
          onViewChange={onViewChange}
          style={{ height: '480px' }}
        />
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'外部控件控制日历'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code>{'ref'}</code>
          {' 获取日历实例，调用 '}
          <code>{'view.previous()'}</code>
          {'、'}
          <code>{'view.next()'}</code>
          {'、'}
          <code>{'view.goToToday()'}</code>
          {' 等方法。也可通过 '}
          <code>{'v-model:view'}</code>
          {' 和 '}
          <code>{'v-model:view-date'}</code>
          {' 实现双向绑定。 '}
        </p>
        <div className={'sd:flex sd:flex-wrap sd:gap-2 sd:mb-3'}>
          <RadioGroup
            type={'button'}
            value={externalView}
            onValueChange={(next) => setExternalView(next as typeof externalView)}
          >
            {views.map((v) => (
              <Radio key={v} value={v}>
                {formatValue(v)}
              </Radio>
            ))}
          </RadioGroup>
        </div>
        <div className={'sd:flex sd:gap-2 sd:mb-3'}>
          <Button
            size={'small'}
            onClick={() => {
              calRef.current?.view.previous();
            }}
          >
            {'◀ 上一个'}
          </Button>
          <Button
            size={'small'}
            onClick={() => {
              calRef.current?.view.goToToday();
            }}
          >
            {'📅 今天'}
          </Button>
          <Button
            size={'small'}
            onClick={() => {
              calRef.current?.view.next();
            }}
          >
            {'下一个 ▶'}
          </Button>
        </div>
        <Calendar
          ref={calRef}
          view={externalView}
          onUpdateView={(next) => setExternalView(next as typeof externalView)}
          viewDate={externalViewDate}
          onUpdateViewDate={(next) => setExternalViewDate(next as typeof externalViewDate)}
          time={false}
          viewsBar={false}
          sm={true}
          style={{ height: '380px' }}
        />
        <p className={'sd:mt-2 sd:text-xs sd:text-gray-500'}>
          {' view: '}
          <code>{formatValue(externalView)}</code>
          {' | viewDate: '}
          <code>{formatValue(externalViewDate)}</code>
        </p>
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'同步两个日历实例'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 左侧为日期选择器模式，选中日期后右侧主日历自动跳转到对应周，实现联动。 '}
        </p>
        <div className={'sd:flex sd:flex-wrap sd:gap-3'}>
          <Calendar
            datePicker={true}
            viewsBar={false}
            selectedDate={syncedDate}
            onUpdateSelectedDate={($event) => {
              setSyncedDate($event);
              setSyncedViewDate($event);
            }}
            style={{ width: '260px', height: '350px' }}
          />
          <Calendar
            viewDate={syncedViewDate}
            selectedDate={syncedDate}
            onUpdateViewDate={($event) => {
              setSyncedViewDate($event);
            }}
            events={demoEvents}
            view={'week'}
            views={['day', 'week']}
            viewsBar={false}
            sm={true}
            style={{ flex: '1', minWidth: '300px', height: '420px' }}
          />
        </div>
        <p className={'sd:mt-2 sd:text-xs sd:text-gray-500'}>
          {'选中日期: '}
          {formatValue(syncedDate)}
        </p>
      </section>
    </>
  );
}
