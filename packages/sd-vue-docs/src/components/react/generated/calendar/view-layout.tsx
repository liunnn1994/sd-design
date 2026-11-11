/** @jsxImportSource react */
import { Calendar, Checkbox, Radio, RadioGroup, Select, ThemeProvider } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';
function classNames(value: unknown): string {
  return Array.isArray(value)
    ? value.map(classNames).filter(Boolean).join(' ')
    : value && typeof value === 'object'
      ? Object.entries(value)
          .filter(([, active]) => active)
          .map(([name]) => name)
          .join(' ')
      : typeof value === 'string'
        ? value
        : '';
}
function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [currentSize, setCurrentSize] = useState('normal');
  const sizes = [
    { label: 'Normal (默认)', value: 'normal' },
    { label: 'sm (紧凑)', value: 'sm' },
    { label: 'xs (超小)', value: 'xs' },
    { label: 'date-picker', value: 'datePicker' },
  ];
  const sizeProps = (() => {
    if (currentSize === 'normal') return {};
    return { [currentSize]: true };
  })();
  const allViews = ['day', 'days', 'week', 'month', 'year', 'years'];
  const viewLabels: Record<string, string> = {
    day: '日',
    days: '多日',
    week: '周',
    month: '月',
    year: '年',
    years: '多年',
  };
  const [enabledViews, setEnabledViews] = useState(['day', 'week', 'month', 'year']);
  const [showTodayButton, setShowTodayButton] = useState(true);
  const [showViewsBar, setShowViewsBar] = useState(true);
  const [showTitleBar, setShowTitleBar] = useState(true);
  const [showTime, setShowTime] = useState(true);
  const [hideWeekends, setHideWeekends] = useState(false);
  const [showWeekNumbers, setShowWeekNumbers] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [currentLocale, setCurrentLocale] =
    useState<NonNullable<ComponentProps<typeof Calendar>['locale']>>('zh-cn');
  const locales = [
    { label: '中文 (zh-cn)', value: 'zh-cn' },
    { label: '英语（en）', value: 'en' },
  ];
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const themeModeOptions = [
    { label: '浅色', value: 'light' },
    { label: '深色', value: 'dark' },
  ];
  const today = new Date();
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
      title: '技术方案讨论',
      backgroundColor: '#10b981',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0),
      title: '跨团队对齐会',
      backgroundColor: '#f59e0b',
      color: '#fff',
    },
  ];
  const horizontalEvents = [
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
      title: '团队例会',
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0),
      title: '项目回顾',
      backgroundColor: '#10b981',
      color: '#fff',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
      title: '客户电话',
      backgroundColor: '#f59e0b',
      color: '#fff',
    },
  ];

  return (
    <>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'布局尺寸'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 日历支持多种布局尺寸：'}
          <code>{'normal'}</code>
          {'（默认）、'}
          <code>{'sm'}</code>
          {'（紧凑）、'}
          <code>{'xs'}</code>
          {'（超小）、'}
          <code>{'date-picker'}</code>
          {'（日期选择器模式，等同于 xs + month/year/years 视图 + clickToNavigate）。 '}
        </p>
        <div className={'sd:flex sd:flex-wrap sd:gap-2 sd:mb-3'}>
          <RadioGroup
            type={'button'}
            value={currentSize}
            onValueChange={(next) => setCurrentSize(next as typeof currentSize)}
          >
            {sizes.map((size) => (
              <Radio key={size.value} value={size.value}>
                {formatValue(size.label)}
              </Radio>
            ))}
          </RadioGroup>
        </div>
        <Calendar {...sizeProps} viewDate={new Date()} style={{ height: '420px' }} />
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'多视图切换'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code>{'views'}</code>
          {' 属性控制可用的视图集合，'}
          <code>{'view'}</code>
          {' 设置当前默认视图。支持 '}
          <code>{'day'}</code>
          {'、'}
          <code>{'days'}</code>
          {'、'}
          <code>{'week'}</code>
          {'、'}
          <code>{'month'}</code>
          {'、'}
          <code>{'year'}</code>
          {'、'}
          <code>{'years'}</code>
          {'。 '}
        </p>
        <div className={'sd:flex sd:flex-wrap sd:gap-2 sd:mb-3'}>
          <span className={'sd:text-sm sd:text-gray-500 sd:self-center'}>{'选择视图:'}</span>
          {allViews.map((v) => (
            <Checkbox
              key={v}
              value={v}
              modelValue={enabledViews}
              onValueChange={(next) => setEnabledViews(next as typeof enabledViews)}
            >
              {formatValue(viewLabels[v])}
            </Checkbox>
          ))}
        </div>
        <Calendar
          view={'month'}
          views={enabledViews}
          viewDate={new Date()}
          events={demoEvents}
          timeFrom={8 * 60}
          timeTo={18 * 60}
          style={{ height: '420px' }}
        />
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'显示/隐藏界面元素'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 日历提供了丰富的界面元素控制开关，可按需隐藏或显示。 '}
        </p>
        <div className={'sd:flex sd:flex-wrap sd:gap-3 sd:mb-3'}>
          <Checkbox
            modelValue={showTodayButton}
            onValueChange={(next) => setShowTodayButton(next as typeof showTodayButton)}
          >
            {'今天按钮'}
          </Checkbox>
          <Checkbox
            modelValue={showViewsBar}
            onValueChange={(next) => setShowViewsBar(next as typeof showViewsBar)}
          >
            {'视图栏'}
          </Checkbox>
          <Checkbox
            modelValue={showTitleBar}
            onValueChange={(next) => setShowTitleBar(next as typeof showTitleBar)}
          >
            {'标题栏'}
          </Checkbox>
          <Checkbox
            modelValue={showTime}
            onValueChange={(next) => setShowTime(next as typeof showTime)}
          >
            {'时间轴'}
          </Checkbox>
          <Checkbox
            modelValue={hideWeekends}
            onValueChange={(next) => setHideWeekends(next as typeof hideWeekends)}
          >
            {'隐藏周末'}
          </Checkbox>
          <Checkbox
            modelValue={showWeekNumbers}
            onValueChange={(next) => setShowWeekNumbers(next as typeof showWeekNumbers)}
          >
            {'显示周数'}
          </Checkbox>
        </div>
        <Calendar
          todayButton={showTodayButton}
          viewsBar={showViewsBar}
          titleBar={showTitleBar}
          time={showTime}
          hideWeekends={hideWeekends}
          weekNumbers={showWeekNumbers}
          events={demoEvents}
          timeFrom={8 * 60}
          timeTo={18 * 60}
          style={{ height: '420px' }}
        />
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'水平时间轴布局'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code>{'horizontal'}</code>
          {' 属性将时间轴改为水平流向，适合甘特图式布局，支持 '}
          <code>{'day'}</code>
          {'、'}
          <code>{'days'}</code>
          {'、'}
          <code>{'week'}</code>
          {' 视图。 '}
        </p>
        <div className={'sd:mb-3'}>
          <Checkbox
            modelValue={isHorizontal}
            onValueChange={(next) => setIsHorizontal(next as typeof isHorizontal)}
          >
            {'启用水平布局'}
          </Checkbox>
        </div>
        <Calendar
          horizontal={isHorizontal}
          events={horizontalEvents}
          viewDate={new Date()}
          style={{ height: '420px' }}
        />
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'国际化 (i18n)'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code>{'locale'}</code>
          {' 属性切换语言，支持 '}
          <code>{'zh-cn'}</code>
          {'（简体中文）、'}
          <code>{'en'}</code>
          {'（英文）。 '}
        </p>
        <div className={'sd:flex sd:items-center sd:gap-2 sd:mb-3'}>
          <span className={'sd:text-sm sd:text-gray-500'}>{'选择语言:'}</span>
          <Select
            value={currentLocale}
            onValueChange={(next) => setCurrentLocale(next as typeof currentLocale)}
            size={'small'}
            className={'sd:w-40'}
            options={locales}
          />
        </div>
        <Calendar
          locale={currentLocale}
          events={demoEvents}
          timeFrom={8 * 60}
          timeTo={18 * 60}
          viewDate={new Date()}
          style={{ height: '420px' }}
        />
      </section>
      <section className={'sd:mb-8'}>
        <h3 className={'sd:text-lg sd:font-semibold sd:mb-3'}>{'暗色模式'}</h3>
        <p className={'sd:mb-3 sd:text-sm sd:text-gray-600'}>
          {' 通过 '}
          <code>{'ThemeProvider'}</code>
          {' 的 '}
          <code>{'theme-mode'}</code>
          {' 属性切换到暗色主题。 '}
        </p>
        <div className={'sd:flex sd:items-center sd:gap-2 sd:mb-3'}>
          <span className={'sd:text-sm sd:text-gray-500'}>{'主题模式:'}</span>
          <RadioGroup
            type={'button'}
            value={themeMode}
            onValueChange={(next) => setThemeMode(next as typeof themeMode)}
            options={themeModeOptions}
          />
        </div>
        <ThemeProvider themeMode={themeMode}>
          <div className={classNames({ 'sd:bg-gray-900': themeMode === 'dark' })}>
            <Calendar
              events={demoEvents}
              timeFrom={8 * 60}
              timeTo={18 * 60}
              viewDate={new Date()}
              style={{ height: '420px' }}
            />
          </div>
        </ThemeProvider>
      </section>
    </>
  );
}
