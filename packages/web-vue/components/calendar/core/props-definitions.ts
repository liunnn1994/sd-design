import type { ExtractPropTypes, PropType } from 'vue';

import type { CalendarEventInput, CalendarSchedule, SpecialHoursRange } from '../types';

export type SpecialHoursInput = Record<
  string,
  | SpecialHoursRange
  | SpecialHoursRange[]
  | {
      default?: SpecialHoursRange | SpecialHoursRange[];
      schedules?: Record<string, SpecialHoursRange | SpecialHoursRange[]>;
    }
>;

export const minutesInADay = 24 * 60; // Don't do the maths every time.

export const props = {
  /**
   * @zh 在日、多日、周视图中以固定顶栏展示全天事件
   * @en Display all-day events in a fixed top bar on the day, days & week views
   */
  allDayEvents: { type: Boolean, default: false }, // Display all-day events in a fixed top bar on the day, days & week views.
  /**
   * @zh 是否堆叠显示相互重叠的事件
   * @en Whether overlapping events are stacked on top of each other
   */
  stackEvents: { type: Boolean, default: false },
  /**
   * @zh specialHours 为空时的别名，结构相同（例如工作时间段）
   * @en Alias for specialHours when specialHours is empty; same shape, kept as a separate prop for clearer naming
   */
  businessHours: { type: Object as PropType<SpecialHoursInput>, default: () => ({}) },
  /**
   * @zh 设为 false 时在日期选择器中强制关闭点击切换视图
   * @en Setting to false forces it off on date-picker
   */
  clickToNavigate: { type: Boolean, default: undefined }, // Setting to false will force it off on date-picker.
  /**
   * @zh 是否在时间列显示当前时间标签
   * @en Show or hide the current time label in the time column
   */
  currentTimeLabel: { type: Boolean, default: false }, // Show or hide the current time label in the time column.
  /**
   * @zh 日期选择器模式的简写，等价于 xs 为 true、views 为 month/year/years、clickToNavigate 为 true
   * @en Shorthand for xs: true, views: [month, year, years], clickToNavigate: true
   */
  datePicker: { type: Boolean, default: false }, // Shorthand for xs: true, views: [month, year, years], clickToNavigate: true.
  /**
   * @zh 需要禁用的具体日期数组
   * @en Array of specific dates to disable
   */
  disableDays: { type: Array as PropType<(string | Date)[]>, default: () => [] }, // Array of specific dates to disable.
  /**
   * @zh 事件的可编辑权限，可为布尔值或细粒度权限对象（drag/resize/resizeX/create/delete）
   * @en Edit permission for events; a boolean or a finer-grained permission object (drag/resize/resizeX/create/delete)
   */
  editableEvents: {
    type: [Boolean, Object] as PropType<
      | boolean
      | { drag?: boolean; resize?: boolean; resizeX?: boolean; create?: boolean; delete?: boolean }
    >,
    default: false,
  },
  /**
   * @zh 创建事件所需的最小拖拽距离（像素），避免浏览时误创建
   * @en Minimum drag distance in pixels to create an event, preventing accidental creation while navigating
   */
  eventCreateMinDrag: { type: Number, default: 15 }, // The minimum drag distance in pixels to create an event.
  /**
   * @zh 日历中展示的事件数组，可只放当前视图的事件，也可放全部可用事件
   * @en The array of events to display; can hold just the view events or the full array of all available events
   */
  events: { type: Array as PropType<CalendarEventInput[]>, default: () => [] },
  /**
   * @zh 在月视图或年视图的单元格中显示事件计数，可为布尔值或指定要显示的视图数组
   * @en Displays an events counter in each cell on month or year view; a boolean or an array of views
   */
  eventCount: { type: [Boolean, Array] as PropType<boolean | string[]>, default: false },
  /**
   * @zh 在月视图中完整展示事件
   * @en Displays events in full on month view
   */
  eventsOnMonthView: { type: Boolean, default: false }, // Displays events in full on month view.
  /**
   * @zh 需要隐藏的星期数组，可选值 mon、tue、wed、thu、fri、sat、sun
   * @en An array of weekday keys to hide; possible values: mon, tue, wed, thu, fri, sat, sun
   */
  hideWeekdays: { type: Array as PropType<string[]>, default: () => [] }, // An array of strings. Possible values: 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'.
  /**
   * @zh 是否在日、周、月视图中隐藏周六与周日
   * @en Show or hide both Saturday and Sunday in days, week and month views
   */
  hideWeekends: { type: Boolean, default: false }, // Show or hide both Saturday and Sunday in days, week and month views.
  /**
   * @zh 横向展示日历时间轴
   * @en Show the calendar timeline horizontally
   */
  horizontal: { type: Boolean, default: false }, // Show the calendar timeline horizontally.
  /**
   * @zh 日历所有文案使用的语言，不支持时回退到 en-us
   * @en The language used for all texts; en-us is the default and fallback
   */
  locale: { type: String, default: '' }, // A language to use for all the texts.
  /**
   * @zh 主要为日期选择器而设，限定单元格可交互的最大日期
   * @en Mostly for date pickers, sets a maximum date for cell interactions
   */
  maxDate: { type: [String, Date], default: '' }, // Mostly for date pickers, sets a maximum date for cell interactions.
  /**
   * @zh 主要为日期选择器而设，限定单元格可交互的最小日期
   * @en Mostly for date pickers, sets a minimum date for cell interactions
   */
  minDate: { type: [String, Date], default: '' }, // Mostly for date pickers, sets a minimum date for cell interactions.
  /**
   * @zh 允许事件跨越多天
   * @en Allow events to span multiple days
   */
  multidayEvents: { type: Boolean, default: true }, // Allow events to span multiple days.
  /**
   * @zh 双向绑定的选中日期，只高亮而不跳转到该日期
   * @en A 2-way binding that highlights the selected date without navigating to it
   */
  selectedDate: { type: [String, Date], default: '' }, // The selected date in the calendar !== viewDate.
  /**
   * @zh 小尺寸，截断文案并使用特定样式
   * @en Small size, truncates texts and uses specific styles
   */
  sm: { type: Boolean, default: false }, // Small size (truncates texts + specific styles).
  /**
   * @zh 按星期高亮特殊时间段，可选按日程覆盖
   * @en Highlight special time ranges per weekday, with optional schedule-specific overrides
   */
  specialHours: { type: Object as PropType<SpecialHoursInput>, default: () => ({}) }, // Highlight special time ranges per weekday, with optional schedule-specific overrides.
  /**
   * @zh 按不同人员、房间或地点的日程拆分一天
   * @en Split a day into different persons/rooms/locations schedules
   */
  schedules: { type: Array as PropType<CalendarSchedule[]>, default: () => [] }, // Split a day in different persons/rooms/locations schedules.
  /**
   * @zh 事件起止时间按指定的分钟间隔对齐
   * @en Snap the event start and end to a specific interval in minutes
   */
  snapToInterval: { type: Number, default: 0 }, // Snap the event start and end to a specific interval in minutes.
  /**
   * @zh 在日、周、月视图中让周日排在周一之前
   * @en Shows Sunday before Monday in days, week and month views
   */
  startWeekOnSunday: { type: Boolean, default: false }, // Shows Sunday before Monday in days, week and month views.
  /**
   * @zh 仅当设为 default 时附加对应的 CSS 类名
   * @en Only adds a CSS class when set to default
   */
  theme: { type: [String, Boolean], default: 'default' }, // Only adds a CSS class when set to default.
  /**
   * @zh 是否显示时间列
   * @en Show or hide the time column
   */
  time: { type: Boolean, default: true }, // Show or hide the time column.
  /**
   * @zh 是否显示光标所在位置的时间线
   * @en Show or hide the "time at cursor" line
   */
  timeAtCursor: { type: Boolean, default: false }, // Show or hide the "time at cursor" line.
  /**
   * @zh 时间单元格的高度（像素）
   * @en Height of the time cells in pixels
   */
  timeCellHeight: { type: Number, default: 40 }, // In pixels.
  /**
   * @zh 覆盖默认的时间格式
   * @en Overrides the default time format
   */
  timeFormat: { type: String, default: '' }, // Overrides the default time format.
  /**
   * @zh 时间列的起始时间（分钟）
   * @en Start time of the time column, in minutes
   */
  timeFrom: { type: Number, default: 0 }, // Start time of the time column, in minutes.
  /**
   * @zh 时间列的时间步长（分钟）
   * @en Step amount for the time in the time column, in minutes
   */
  timeStep: { type: Number, default: 60 }, // Step amount for the time in the time column, in minutes.
  /**
   * @zh 时间列的结束时间（分钟）
   * @en End time of the time column, in minutes
   */
  timeTo: { type: Number, default: minutesInADay }, // End time of the time column, in minutes.
  /**
   * @zh 是否显示标题栏
   * @en Show or hide the header title bar
   */
  titleBar: { type: Boolean, default: true }, // Show or hide the header title bar.
  /**
   * @zh 是否显示标题栏的今天按钮
   * @en Show or hide the header today button
   */
  todayButton: { type: Boolean, default: true }, // Show or hide the header today button.
  /**
   * @zh 是否使用 12 小时制
   * @en 12 or 24 hour format are respectively written like 1pm and 13:00
   */
  twelveHour: { type: Boolean, default: false }, // 12 or 24 hour format are respectively written like 1pm and 13:00.
  /**
   * @zh 日历视图，可选 day、days、week、month、year、years，日期选择器下默认 month，切换视图时会更新
   * @en The calendar view; one of day, days, week, month, year, years. Defaults to month on date-picker, and is updated on navigation
   */
  view: { type: String, default: '' },
  /**
   * @zh 视图会据此日期自动计算起止范围
   * @en The view automatically sets its start and end to present this date
   */
  viewDate: { type: [String, Date], default: '' }, // The view will automatically set its start and end to present this date.
  /**
   * @zh 将视图起点按带符号的天数左右平移，仅月视图与日视图可用
   * @en Shifts the start of the view left or right by x signed days; only for month and day views
   */
  viewDayOffset: { type: Number, default: 0 },
  /**
   * @zh 可用的视图列表，普通布局默认 day/days/week/month/year/years，日期选择器布局默认 month/year/years
   * @en The list of views available in this calendar; defaults to all views, or month/year/years for date-picker layout
   */
  views: {
    type: [Array, Object] as PropType<
      readonly string[] | Record<string, { cols?: number; rows?: number }>
    >,
  },
  /**
   * @zh 是否显示视图切换栏
   * @en Show or hide the header view selection bar
   */
  viewsBar: { type: Boolean, default: true }, // Show or hide the headers view selection bar.
  /**
   * @zh 实时更新当前时间，开销较大，需按需开启
   * @en Watch the current time in real time; more expensive, so only trigger on demand
   */
  watchRealTime: { type: Boolean, default: false }, // More expensive, so only trigger on demand.
  /**
   * @zh 在月视图中以单独一列显示周数
   * @en Show the week numbers in a column on month view
   */
  weekNumbers: { type: Boolean, default: false }, // Show the weeks numbers in a column on month view.
  /**
   * @zh 日期选择器使用的极小尺寸，截断文案并使用特定样式
   * @en Extra small size for date pickers, truncates texts and uses specific styles
   */
  xs: { type: Boolean, default: false }, // Extra small size for date pickers (truncates texts + specific styles).
};

export type CalendarProps = ExtractPropTypes<typeof props>;
