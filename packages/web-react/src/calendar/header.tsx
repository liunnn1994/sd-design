import type { ReactNode } from 'react';

import type { resolveCalendarConfig } from './config.js';
import type { CalendarTexts } from './types.js';
import type { createCalendarViewController } from './view-controller.js';

import { CalendarTransition } from './transition.js';

type Controller = ReturnType<typeof createCalendarViewController>;
type HeaderView = Controller['layout'] & Controller['state'];

export interface CalendarHeaderProps {
  prefixCls: string;
  config: ReturnType<typeof resolveCalendarConfig>;
  texts: CalendarTexts;
  controller: Controller;
  previousLabel: string;
  nextLabel: string;
  renderHeader?: ((view: HeaderView) => ReactNode) | undefined;
  renderTitle?: ((view: HeaderView) => ReactNode) | undefined;
  renderViewTitle?: Record<string, (view: HeaderView) => ReactNode>;
  previousButton?: ReactNode;
  nextButton?: ReactNode;
  renderTodayButton?: ((options: { navigate(): void; active: boolean }) => ReactNode) | undefined;
}

export function CalendarHeader({
  prefixCls: prefix,
  config,
  texts,
  controller,
  previousLabel,
  nextLabel,
  renderHeader,
  renderTitle,
  renderViewTitle,
  previousButton,
  nextButton,
  renderTodayButton,
}: CalendarHeaderProps) {
  const view = { ...controller.state, ...controller.layout };
  const navigation = controller.navigation;
  const Title = config.clickToNavigate && view.broaderView ? 'button' : 'div';
  const titleRenderer = renderViewTitle?.[view.id] ?? renderTitle;
  const today = {
    active: !!view.containsToday,
    navigate() {
      if (!view.containsToday) navigation.goToToday();
    },
  };
  return (
    <div className={`${prefix}__header`}>
      {renderHeader ? (
        renderHeader(view)
      ) : (
        <>
          {config.viewsBar && (
            <div className={`${prefix}__views-bar`}>
              {Object.keys(config.availableViews).map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`${prefix}__view-button${view.id === id ? ` ${prefix}__view-button--active` : ''}`}
                  aria-pressed={view.id === id}
                  onClick={() => navigation.switchView(id)}
                >
                  {texts[id as 'day' | 'days' | 'week' | 'month' | 'year' | 'years']}
                </button>
              ))}
            </div>
          )}
          {config.titleBar && (
            <nav className={`${prefix}__title-bar`}>
              <button
                type="button"
                aria-label={previousLabel}
                className={`${prefix}__nav ${prefix}__nav--prev${previousButton === undefined ? ` ${prefix}__nav--default` : ''}`}
                onClick={() => navigation.previous()}
              >
                {previousButton}
              </button>
              <div className={`${prefix}__transition-wrap`}>
                <CalendarTransition
                  identity={`${view.id}:${view.start.getTime()}`}
                  name={`${prefix}-slide-fade--${view.transitionDirection}`}
                >
                  <Title
                    type={Title === 'button' ? 'button' : undefined}
                    className={`${prefix}__title`}
                    onClick={
                      config.clickToNavigate ? () => navigation.switchToBroaderView() : undefined
                    }
                  >
                    {titleRenderer ? (
                      titleRenderer(view)
                    ) : (
                      <>
                        {view.title}
                        {view.titleWeekInfo && (
                          <small>
                            &nbsp;{view.titleWeekInfo.text} {view.titleWeekInfo.number}
                          </small>
                        )}
                      </>
                    )}
                  </Title>
                </CalendarTransition>
              </div>
              {config.todayButton &&
                (renderTodayButton ? (
                  renderTodayButton(today)
                ) : (
                  <button
                    type="button"
                    disabled={today.active}
                    onClick={today.navigate}
                    className={`${prefix}__nav ${prefix}__nav--today ${prefix}__nav--default${today.active ? ` ${prefix}__nav--active` : ''}`}
                  >
                    {texts.today}
                  </button>
                ))}
              <button
                type="button"
                aria-label={nextLabel}
                className={`${prefix}__nav ${prefix}__nav--next${nextButton === undefined ? ` ${prefix}__nav--default` : ''}`}
                onClick={() => navigation.next()}
              >
                {nextButton}
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
