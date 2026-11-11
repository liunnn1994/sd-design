/** @jsxImportSource react */
import { Button, Calendar, Checkbox, Tag } from '@sdata/web-react';
import { useRef } from 'react';
import { useEffect, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const today = new Date();
  const [snapToInterval, setSnapToInterval] = useState(false);
  const [canCreate, setCanCreate] = useState(true);
  const [canResize, setCanResize] = useState(false);
  const [canDrag, setCanDrag] = useState(false);
  const [canDelete, setCanDelete] = useState(true);
  const editableEventsConfig = (() => ({
    create: canCreate,
    resize: canResize,
    drag: canDrag,
    delete: canDelete,
  }))();
  const [createEvents, setCreateEvents] = useState([
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
      title: '团队例会',
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 30),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 13, 30),
      title: '医生预约',
      backgroundColor: '#57cea9cc',
      color: '#fff',
    },
  ]);
  const eventCounter = useRef(2);
  const [vModelEvents, setVModelEvents] = useState([
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      title: '事件 1',
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0),
      title: '事件 2',
      backgroundColor: '#10b981',
      color: '#fff',
    },
  ]);
  const onVModelEventCreate = ({
    event,
    resolve,
  }: import('@sdata/web-react').CalendarEventCreate) => {
    eventCounter.current++;
    resolve({
      ...event,
      title: event.title || `事件 ${eventCounter.current}`,
      backgroundColor: event.backgroundColor || '#f59e0b',
      color: event.color || '#fff',
    });
  };
  const addEvent = () => {
    eventCounter.current++;

    const lastEvent = vModelEvents[vModelEvents.length - 1];
    const lastEventEnd = lastEvent ? new Date(lastEvent.end) : new Date();

    setVModelEvents((previous) => {
      const next = [...previous];
      next.push({
        start: lastEventEnd
          ? new Date(lastEventEnd)
          : new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        end: lastEventEnd
          ? new Date(
              lastEventEnd.getFullYear(),
              lastEventEnd.getMonth(),
              lastEventEnd.getDate(),
              lastEventEnd.getHours() + 1,
              lastEventEnd.getMinutes(),
              lastEventEnd.getSeconds(),
            )
          : new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0), // will be adjusted
        title: `事件 ${eventCounter.current}`,
        backgroundColor: '#f59e0b',
        color: '#fff',
      });
      return next;
    });
  };
  const [dragEnabled, setDragEnabled] = useState(true);
  const [snapDragToHour, setSnapDragToHour] = useState(false);
  const [dragEvents, setDragEvents] = useState([
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
      title: '可拖拽事件',
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
      title: '另一个事件',
      backgroundColor: '#10b981',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 12, 0),
      title: '固定事件',
      backgroundColor: '#8b5cf6',
      color: '#fff',
      draggable: false,
      deletable: false,
      resizable: false,
    },
  ]);
  const colors = ['crimson', 'cornflowerblue', 'darkgreen', 'blueviolet', 'darkmagenta', 'teal'];
  const [reactiveEvents, setReactiveEvents] = useState([
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 11, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 12, 30),
      title: '事件 A',
      backgroundColor: 'crimson',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 30),
      title: '事件 B',
      backgroundColor: 'cornflowerblue',
      color: '#fff',
    },
  ]);
  const colorInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    colorInterval.current = setInterval(() => {
      if (reactiveEvents[0]) {
        setReactiveEvents((previous) => {
          const draft = structuredClone(previous);
          draft[0].backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          return draft;
        });
      }
      if (reactiveEvents[1]) {
        setReactiveEvents((previous) => {
          const draft = structuredClone(previous);
          draft[1].backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          return draft;
        });
      }
    }, 1000);
  }, []);
  useEffect(
    () => () => {
      if (colorInterval.current) clearInterval(colorInterval.current);
    },
    [],
  );
  const [preventOverlapDrop, setPreventOverlapDrop] = useState(true);
  const [preventOverlapResize, setPreventOverlapResize] = useState(true);
  const [rejectOverlapEvents, setRejectOverlapEvents] = useState([
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
      title: '事件 1',
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0),
      title: '事件 2',
      backgroundColor: '#10b981',
      color: '#fff',
    },
  ]);
  const onEventDrop = ({ overlaps }: { overlaps: import('@sdata/web-react').CalendarEvent[] }) => {
    if (preventOverlapDrop && overlaps && overlaps.length) return false;
    return true;
  };
  const onEventResize = ({
    overlaps,
  }: {
    overlaps: import('@sdata/web-react').CalendarEvent[];
  }) => {
    if (preventOverlapResize && overlaps && overlaps.length) return false;
    return true;
  };

  return (
    <>
      <section data-v-6b6a5d9b="" className={'sd:mb-8'}>
        <h3 data-v-6b6a5d9b="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'创建事件'}
        </h3>
        <p data-v-6b6a5d9b="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 设置 '}
          <code data-v-6b6a5d9b="">{'editable-events'}</code>
          {' 后，默认通过 '}
          <strong data-v-6b6a5d9b="">{'点击拖动'}</strong>
          {' 在单元格上创建事件。也可更精细地控制权限：'}
          <code data-v-6b6a5d9b="">{'{ create, resize, drag, delete }'}</code>
          {'。通过 '}
          <code data-v-6b6a5d9b="">{'snap-to-interval'}</code>
          {' 可使事件开始/结束对齐到指定分钟间隔。 '}
        </p>
        <div data-v-6b6a5d9b="" className={'sd:flex sd:flex-wrap sd:gap-3 sd:mb-3 sd:items-center'}>
          <Checkbox
            data-v-6b6a5d9b=""
            modelValue={snapToInterval}
            onValueChange={(next) => setSnapToInterval(next as typeof snapToInterval)}
          >
            {'对齐到 15 分钟'}
          </Checkbox>
          <Checkbox
            data-v-6b6a5d9b=""
            modelValue={canCreate}
            onValueChange={(next) => setCanCreate(next as typeof canCreate)}
          >
            {'允许创建'}
          </Checkbox>
          <Checkbox
            data-v-6b6a5d9b=""
            modelValue={canResize}
            onValueChange={(next) => setCanResize(next as typeof canResize)}
          >
            {'允许缩放'}
          </Checkbox>
          <Checkbox
            data-v-6b6a5d9b=""
            modelValue={canDrag}
            onValueChange={(next) => setCanDrag(next as typeof canDrag)}
          >
            {'允许拖拽'}
          </Checkbox>
          <Checkbox
            data-v-6b6a5d9b=""
            modelValue={canDelete}
            onValueChange={(next) => setCanDelete(next as typeof canDelete)}
          >
            {'允许删除'}
          </Checkbox>
        </div>
        <Calendar
          data-v-6b6a5d9b=""
          editableEvents={editableEventsConfig}
          snapToInterval={snapToInterval ? 15 : 0}
          events={createEvents}
          timeFrom={9 * 60}
          timeTo={15 * 60}
          views={{ days: { cols: 5, rows: 1 } }}
          view={'days'}
          viewsBar={false}
          style={{ height: '320px' }}
        />
        <p data-v-6b6a5d9b="" className={'sd:mt-1 sd:text-xs sd:text-gray-400'}>
          {'提示: 点击并拖动某个时间段即可创建事件；双击事件可删除。'}
        </p>
      </section>
      <section data-v-6b6a5d9b="" className={'sd:mb-8'}>
        <h3 data-v-6b6a5d9b="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'事件 v-model 双向绑定'}
        </h3>
        <p data-v-6b6a5d9b="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code data-v-6b6a5d9b="">{'v-model:events'}</code>
          {
            ' 实现事件数组的双向绑定，外部修改会自动反映到日历中。下方列表展示当前事件，并可与日历互动。 '
          }
        </p>
        <div data-v-6b6a5d9b="" className={'sd:flex sd:gap-2 sd:mb-3'}>
          <Button data-v-6b6a5d9b="" size={'small'} status={'success'} onClick={addEvent}>
            {'+ 添加事件'}
          </Button>
          <Button
            data-v-6b6a5d9b=""
            size={'small'}
            status={'danger'}
            onClick={() => {
              setVModelEvents((previous) => {
                const next = [...previous];
                next.pop();
                return next;
              });
            }}
          >
            {'移除最后'}
          </Button>
        </div>
        <div data-v-6b6a5d9b="" className={'sd:mb-3 sd:flex sd:flex-wrap sd:gap-2'}>
          {vModelEvents.map((event, i) => (
            <Tag data-v-6b6a5d9b="" key={i} color={event.backgroundColor}>
              {formatValue(event.title)}
            </Tag>
          ))}
          {!vModelEvents.length ? (
            <span data-v-6b6a5d9b="" className={'sd:text-xs sd:text-gray-400'}>
              {'暂无事件'}
            </span>
          ) : null}
        </div>
        <Calendar
          data-v-6b6a5d9b=""
          events={vModelEvents}
          onUpdateEvents={(next) => setVModelEvents(next as typeof vModelEvents)}
          editableEvents={true}
          timeFrom={9 * 60}
          views={{ days: { cols: 5, rows: 1 } }}
          view={'days'}
          viewsBar={false}
          style={{ height: '320px' }}
          onEventCreate={onVModelEventCreate}
        />
      </section>
      <section data-v-6b6a5d9b="" className={'sd:mb-8'}>
        <h3 data-v-6b6a5d9b="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'事件拖拽 (Drag & Drop)'}
        </h3>
        <p data-v-6b6a5d9b="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 单天前景事件支持 HTML5 原生拖拽。拖拽时原事件获得 '}
          <code data-v-6b6a5d9b="">{'.sd-calendar__event--dragging-original'}</code>
          {' 类，幽灵元素获得 '}
          <code data-v-6b6a5d9b="">{'.sd-calendar__event--dragging-ghost'}</code>
          {' 类。通过 '}
          <code data-v-6b6a5d9b="">{'@event-drop'}</code>
          {' 可返回 '}
          <code data-v-6b6a5d9b="">{'false'}</code>
          {' 拒绝放置。 '}
        </p>
        <div data-v-6b6a5d9b="" className={'sd:flex sd:flex-wrap sd:gap-3 sd:mb-3'}>
          <Checkbox
            data-v-6b6a5d9b=""
            modelValue={dragEnabled}
            onValueChange={(next) => setDragEnabled(next as typeof dragEnabled)}
          >
            {'允许拖拽'}
          </Checkbox>
          <Checkbox
            data-v-6b6a5d9b=""
            modelValue={snapDragToHour}
            onValueChange={(next) => setSnapDragToHour(next as typeof snapDragToHour)}
          >
            {'对齐到整点'}
          </Checkbox>
        </div>
        <Calendar
          data-v-6b6a5d9b=""
          editableEvents={{ drag: dragEnabled }}
          snapToInterval={snapDragToHour ? 60 : 0}
          events={dragEvents}
          timeFrom={9 * 60}
          timeTo={15 * 60}
          views={{ days: { cols: 5, rows: 1 } }}
          view={'days'}
          viewsBar={false}
          style={{ height: '340px' }}
        />
      </section>
      <section data-v-6b6a5d9b="" className={'sd:mb-8'}>
        <h3 data-v-6b6a5d9b="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'事件响应性'}
        </h3>
        <p data-v-6b6a5d9b="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 事件数组是响应式的 — 外部修改事件的属性（如 '}
          <code data-v-6b6a5d9b="">{'backgroundColor'}</code>
          {'）会实时反映在日历中。下方示例每秒随机变换事件背景色。 '}
        </p>
        <Calendar
          data-v-6b6a5d9b=""
          events={reactiveEvents}
          editableEvents={true}
          timeFrom={9 * 60}
          timeTo={15 * 60}
          views={{ days: { cols: 3, rows: 1 } }}
          view={'days'}
          viewsBar={false}
          style={{ height: '280px' }}
        />
      </section>
      <section data-v-6b6a5d9b="" className={'sd:mb-8'}>
        <h3 data-v-6b6a5d9b="" className={'sd:text-lg sd:font-semibold sd:mb-3'}>
          {'拒绝拖拽/缩放重叠'}
        </h3>
        <p data-v-6b6a5d9b="" className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code data-v-6b6a5d9b="">{'@event-drop'}</code>
          {' 和 '}
          <code data-v-6b6a5d9b="">{'@event-resize'}</code>
          {' 返回 '}
          <code data-v-6b6a5d9b="">{'false'}</code>
          {' 可拒绝冲突的拖拽或缩放操作。 '}
        </p>
        <div data-v-6b6a5d9b="" className={'sd:flex sd:flex-wrap sd:gap-3 sd:mb-3'}>
          <Checkbox
            data-v-6b6a5d9b=""
            modelValue={preventOverlapDrop}
            onValueChange={(next) => setPreventOverlapDrop(next as typeof preventOverlapDrop)}
          >
            {'拖拽时拒绝重叠'}
          </Checkbox>
          <Checkbox
            data-v-6b6a5d9b=""
            modelValue={preventOverlapResize}
            onValueChange={(next) => setPreventOverlapResize(next as typeof preventOverlapResize)}
          >
            {'缩放时拒绝重叠'}
          </Checkbox>
        </div>
        <Calendar
          data-v-6b6a5d9b=""
          events={rejectOverlapEvents}
          editableEvents={true}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          timeFrom={9 * 60}
          timeTo={15 * 60}
          style={{ height: '340px' }}
        />
      </section>
      <style>{'\n.sd-calendar__event {\n    transition: background-color 1s;\n}\n'}</style>
    </>
  );
}
