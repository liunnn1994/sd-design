import type {
  CarouselAutoPlayConfig,
  CarouselArrowType,
  CarouselIndicatorPosition,
  CarouselIndicatorType,
  CarouselTriggerEvent,
  CarouselIndexes,
} from '@sdata/web-core/carousel/types';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, HTMLAttributes, MouseEvent, Ref } from 'react';

import { onActivate } from '@sdata/web-core/_utils/keyboard';
import {
  createCarousel,
  getCarouselAutoPlay,
  getCarouselIndexes,
} from '@sdata/web-core/carousel/foundation';
import {
  createCarouselIndicator,
  getCarouselSliderStyle,
} from '@sdata/web-core/carousel/indicator';
import { getCarouselItemState, getCarouselAnimationStyle } from '@sdata/web-core/carousel/item';
import {
  createContext,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useItemIndex } from '../_shared/use-item-index.js';
import { usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';

export type {
  CarouselAutoPlayConfig,
  CarouselArrowType,
  CarouselIndicatorPosition,
  CarouselIndicatorType,
  CarouselTriggerEvent,
};
export interface CarouselRef {
  prev(): void;
  next(): void;
  goTo(index: number): void;
}
export interface CarouselProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  current?: number;
  defaultCurrent?: number;
  autoPlay?: boolean | CarouselAutoPlayConfig;
  moveSpeed?: number;
  animationName?: 'slide' | 'fade' | 'card';
  trigger?: CarouselTriggerEvent;
  direction?: 'horizontal' | 'vertical';
  showArrow?: CarouselArrowType;
  arrowClass?: string;
  indicatorType?: CarouselIndicatorType;
  indicatorPosition?: CarouselIndicatorPosition;
  indicatorClass?: string;
  transitionTimingFunction?: string;
  onCurrentChange?: (index: number) => void;
  onChange?: (index: number, previousIndex: number, isManual: boolean) => void;
  ref?: Ref<CarouselRef>;
}
export interface CarouselItemProps extends ComponentPropsWithRef<'div'> {}
interface CarouselContextValue {
  ownerId: string;
  parentCls: string;
  count: number;
  mergedIndexes: CarouselIndexes;
  previousIndex?: number | undefined;
  slideDirection?: 'positive' | 'negative' | undefined;
  animationName: string;
  transitionTimingFunction: string;
  moveSpeed: number;
}
const CarouselContext = createContext<CarouselContextValue | undefined>(undefined);
const CollectorContext = createContext<
  { collect(id: string, index: number): void; remove(id: string): void } | undefined
>(undefined);

function CarouselRoot({
  current,
  defaultCurrent = 1,
  autoPlay = false,
  moveSpeed = 500,
  animationName = 'slide',
  trigger = 'click',
  direction = 'horizontal',
  showArrow = 'always',
  arrowClass = '',
  indicatorType = 'dot',
  indicatorPosition = 'bottom',
  indicatorClass = '',
  transitionTimingFunction = 'cubic-bezier(0.34, 0.69, 0.1, 1)',
  onCurrentChange,
  onChange,
  ref,
  children,
  className,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  ...attrs
}: CarouselProps) {
  const ownerId = encodeURIComponent(useId());
  const prefix = usePrefix('carousel');
  const indicatorPrefix = usePrefix('carousel-indicator');
  const iconPrefix = usePrefix('icon');
  const { t } = useI18n();
  const [items, setItems] = useState(new Map<string, number>());
  const [collector] = useState(() => ({
    collect(id: string, index: number) {
      setItems((old) => (old.get(id) === index ? old : new Map(old).set(id, index)));
    },
    remove(id: string) {
      setItems((old) => {
        if (!old.has(id)) return old;
        const next = new Map(old);
        next.delete(id);
        return next;
      });
    },
  }));
  const count = items.size;
  const [innerIndex, setInner] = useState(defaultCurrent - 1);
  const [previousIndex, setPrevious] = useState<number>();
  const [slideDirection, setDirection] = useState<'positive' | 'negative'>();
  const [paused, setPaused] = useState(false);
  const computedAutoPlay = getCarouselAutoPlay(autoPlay);
  const live = useRef({
    current,
    moveSpeed,
    count,
    innerIndex,
    previousIndex,
    slideDirection,
    paused,
    computedAutoPlay,
    onCurrentChange,
    onChange,
    indicatorType,
  });
  live.current = {
    current,
    moveSpeed,
    count,
    innerIndex,
    previousIndex,
    slideDirection,
    paused,
    computedAutoPlay,
    onCurrentChange,
    onChange,
    indicatorType,
  };
  const [foundation] = useState(() =>
    createCarousel({
      get props() {
        return live.current;
      },
      get count() {
        return live.current.count;
      },
      get indexes() {
        return getCarouselIndexes(
          live.current.current,
          live.current.innerIndex,
          live.current.count,
        );
      },
      get autoPlay() {
        return live.current.computedAutoPlay;
      },
      get innerIndex() {
        return live.current.innerIndex;
      },
      set innerIndex(value) {
        live.current.innerIndex = value;
        setInner(value);
      },
      get previousIndex() {
        return live.current.previousIndex;
      },
      set previousIndex(value) {
        live.current.previousIndex = value;
        setPrevious(value);
      },
      get slideDirection() {
        return live.current.slideDirection;
      },
      set slideDirection(value) {
        live.current.slideDirection = value;
        setDirection(value);
      },
      get paused() {
        return live.current.paused;
      },
      set paused(value) {
        live.current.paused = value;
        setPaused(value);
      },
      setInterval: (callback, delay) => window.setInterval(callback, delay),
      clearInterval: (timer) => window.clearInterval(timer),
      setTimeout: (callback, delay) => window.setTimeout(callback, delay),
      clearTimeout: (timer) => window.clearTimeout(timer),
      onUpdate: (value) => live.current.onCurrentChange?.(value),
      onChange: (value, previous, manual) => live.current.onChange?.(value, previous, manual),
    }),
  );
  useLayoutEffect(() => foundation.syncIndex(), [foundation, count, current]);
  useLayoutEffect(
    () => foundation.syncAutoPlay(),
    [
      foundation,
      count,
      current,
      innerIndex,
      computedAutoPlay.interval,
      computedAutoPlay.hoverToPause,
      paused,
    ],
  );
  useLayoutEffect(() => () => foundation.dispose(), [foundation]);
  useImperativeHandle(
    ref,
    () => ({ prev: foundation.prev, next: foundation.next, goTo: foundation.goTo }),
    [foundation],
  );
  const indexes = getCarouselIndexes(current, innerIndex, count);
  const [indicator] = useState(() =>
    createCarouselIndicator({
      get props() {
        return {
          type: live.current.indicatorType,
          count: live.current.count,
          activeIndex: getCarouselIndexes(
            live.current.current,
            live.current.innerIndex,
            live.current.count,
          ).mergedIndex,
        };
      },
      onSelect: foundation.select,
    }),
  );
  const select = (event: MouseEvent<HTMLDivElement>) =>
    indicator.click({
      target: event.target,
      currentTarget: event.currentTarget,
      offsetX: event.nativeEvent.offsetX,
      preventDefault: () => event.preventDefault(),
    });
  const context = {
    ownerId,
    parentCls: prefix,
    count,
    mergedIndexes: indexes,
    previousIndex,
    slideDirection,
    animationName,
    transitionTimingFunction,
    moveSpeed,
  };
  return (
    <CarouselContext.Provider value={context}>
      <CollectorContext.Provider value={collector}>
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label={t('a11y.carousel')}
          tabIndex={0}
          {...attrs}
          className={[prefix, `${prefix}-indicator-position-${indicatorPosition}`, className]
            .filter(Boolean)
            .join(' ')}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            foundation.keydown(event.nativeEvent);
          }}
          onMouseEnter={(event) => {
            onMouseEnter?.(event);
            foundation.enter();
          }}
          onMouseLeave={(event) => {
            onMouseLeave?.(event);
            foundation.leave();
          }}
        >
          <div
            className={[
              `${prefix}-${animationName}`,
              `${prefix}-${direction}`,
              slideDirection === 'negative' && `${prefix}-negative`,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </div>
          {indicatorType !== 'never' && count > 1 && (
            <div
              className={`${prefix}-indicator-wrapper ${prefix}-indicator-wrapper-${indicatorPosition}`}
            >
              <div
                className={[
                  indicatorPrefix,
                  `${indicatorPrefix}-${indicatorType}`,
                  `${indicatorPrefix}-${indicatorPosition}`,
                  indicatorClass,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={trigger === 'click' ? select : undefined}
                onMouseOver={trigger === 'hover' ? select : undefined}
              >
                {indicatorType === 'slider' ? (
                  <span
                    style={getCarouselSliderStyle(count, indexes.mergedIndex)}
                    aria-label={t('a11y.slideOf', indexes.mergedIndex + 1, count)}
                    className={`${indicatorPrefix}-item ${indicatorPrefix}-item-active`}
                  />
                ) : (
                  Array.from({ length: count }, (_, index) => (
                    <span
                      key={index}
                      role="button"
                      tabIndex={0}
                      data-index={index}
                      aria-label={t('a11y.goToSlide', index + 1)}
                      aria-current={index === indexes.mergedIndex ? 'true' : undefined}
                      className={[
                        `${indicatorPrefix}-item`,
                        index === indexes.mergedIndex && `${indicatorPrefix}-item-active`,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onKeyDown={(event) => indicator.keydown(event.nativeEvent, index)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
          {showArrow !== 'never' && count > 1 && (
            <div
              className={[
                `${prefix}-arrow`,
                showArrow === 'hover' && `${prefix}-arrow-hover`,
                arrowClass,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {(['previous', 'next'] as const).map((which) => {
                const side =
                  direction === 'vertical'
                    ? which === 'previous'
                      ? 'top'
                      : 'bottom'
                    : which === 'previous'
                      ? 'left'
                      : 'right';
                const action = which === 'previous' ? foundation.prev : foundation.next;
                const path =
                  side === 'left'
                    ? 'M32 8.4 16.444 23.956 32 39.513'
                    : side === 'right'
                      ? 'm16 39.513 15.556-15.557L16 8.4'
                      : side === 'top'
                        ? 'M39.6 30.557 24.043 15 8.487 30.557'
                        : 'M39.6 17.443 24.043 33 8.487 17.443';
                return (
                  <div
                    key={which}
                    role="button"
                    tabIndex={0}
                    aria-label={t(which === 'previous' ? 'a11y.prevSlide' : 'a11y.nextSlide')}
                    className={`${prefix}-arrow-${side}`}
                    onClick={action}
                    onKeyDown={(event) => onActivate(action)(event.nativeEvent)}
                  >
                    <svg
                      className={iconPrefix}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={4}
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path d={path} />
                    </svg>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CollectorContext.Provider>
    </CarouselContext.Provider>
  );
}
export function CarouselItem({ children, className, style, ref, ...attrs }: CarouselItemProps) {
  const prefix = usePrefix('carousel-item');
  const context = useContext(CarouselContext);
  const collector = useContext(CollectorContext);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const index = useItemIndex(
    root,
    `[data-carousel-item="${context?.ownerId}"]`,
    context?.parentCls,
  );
  const { t } = useI18n();
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => {
    if (index >= 0) collector?.collect(id, index);
    else collector?.remove(id);
  }, [collector, id, index]);
  useLayoutEffect(() => () => collector?.remove(id), [collector, id]);
  const state = getCarouselItemState(index, context ?? {});
  return (
    <div
      {...attrs}
      ref={root}
      data-carousel-item={context?.ownerId}
      role="group"
      aria-roledescription="slide"
      aria-label={t('a11y.slideOf', index + 1, context?.count ?? 0)}
      aria-hidden={!state.current}
      className={[
        state.prev && `${prefix}-prev`,
        state.next && `${prefix}-next`,
        state.current && `${prefix}-current`,
        state.slideIn && `${prefix}-slide-in`,
        state.slideOut && `${prefix}-slide-out`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        ...getCarouselAnimationStyle(context?.transitionTimingFunction, context?.moveSpeed),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
export const Carousel = Object.assign(CarouselRoot, { Item: CarouselItem });
export default Carousel;

export type CarouselInstance = ReactComponentRef<typeof Carousel>;
export type CarouselItemInstance = ReactComponentRef<typeof CarouselItem>;
