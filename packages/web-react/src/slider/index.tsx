import type {
  SliderValue,
  SliderFormatTooltip,
  SliderChangeHandler,
  SliderRect,
} from '@sdata/web-core/slider/types';
import type { ComponentPropsWithRef, CSSProperties } from 'react';

import {
  getSliderInitialValues,
  getSliderBarStyle,
  getSliderMarks,
  getSliderTicks,
  getSliderInputValue,
  getPositionStyle,
  getOffsetPercent,
} from '@sdata/web-core/slider/data';
import { createSliderDragFoundation } from '@sdata/web-core/slider/drag';
import { createSliderFoundation } from '@sdata/web-core/slider/foundation';
import { useLayoutEffect, useRef, useState } from 'react';

import { usePrefix } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';
import { InputNumber } from '../input-number/index.js';
import { Tooltip } from '../tooltip/index.js';

export type {
  SliderValue,
  SliderFormatTooltip,
  SliderChangeHandler,
} from '@sdata/web-core/slider/types';
export type SliderInstance = HTMLDivElement;
export interface SliderProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'onChange' | 'defaultValue' | 'children'
> {
  value?: SliderValue;
  defaultValue?: SliderValue;
  step?: number;
  min?: number;
  max?: number;
  marks?: Record<number, string>;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  showTicks?: boolean;
  showInput?: boolean;
  range?: boolean;
  formatTooltip?: SliderFormatTooltip;
  showTooltip?: boolean;
  onValueChange?: SliderChangeHandler;
  onChange?: SliderChangeHandler;
}

function SliderHandle(props: {
  value: number;
  min: number;
  max: number;
  direction: 'horizontal' | 'vertical';
  disabled: boolean;
  formatTooltip?: SliderFormatTooltip;
  showTooltip: boolean;
  style: CSSProperties;
  onStart(): void;
  onMove(x: number, y: number): void;
  onKeyDown(event: KeyboardEvent): void;
}) {
  const prefix = usePrefix('slider-btn');
  const element = useRef<HTMLDivElement>(null);
  const current = useRef(props);
  current.current = props;
  const [dragging, setDragging] = useState(false);
  const [drag] = useState(() =>
    createSliderDragFoundation({
      getTarget: () => element.current?.ownerDocument.defaultView ?? window,
      isDisabled: () => current.current.disabled,
      setDragging,
      onStart: () => current.current.onStart(),
      onMove: (x, y) => current.current.onMove(x, y),
      onEnd: () => {},
    }),
  );
  useLayoutEffect(() => {
    const node = element.current;
    // React delegates touchstart passively; this gesture must cancel native scrolling.
    node?.addEventListener('touchstart', drag.start, { passive: false });
    return () => {
      node?.removeEventListener('touchstart', drag.start);
      drag.cleanup();
    };
  }, [drag]);
  useLayoutEffect(() => {
    if (props.disabled) drag.cleanup();
  }, [props.disabled, drag]);
  const content = props.formatTooltip?.(props.value) ?? String(props.value);
  return (
    <Tooltip
      content={content}
      position={props.direction === 'vertical' ? 'right' : 'top'}
      popupVisible={props.showTooltip ? (dragging ? true : undefined) : false}
    >
      <div
        ref={element}
        className={prefix}
        style={props.style}
        tabIndex={props.disabled ? -1 : 0}
        role="slider"
        aria-disabled={props.disabled}
        aria-valuemin={props.min}
        aria-valuemax={props.max}
        aria-valuenow={props.value}
        aria-valuetext={content}
        onMouseDown={(event) => drag.start(event.nativeEvent)}
        onContextMenu={(event) => event.preventDefault()}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (!props.disabled) props.onKeyDown(event.nativeEvent);
        }}
      />
    </Tooltip>
  );
}

export function Slider(props: SliderProps) {
  const {
    value,
    defaultValue = 0,
    step = 1,
    min = 0,
    max = 100,
    marks,
    direction = 'horizontal',
    disabled: _disabled,
    showTicks = false,
    showInput = false,
    range = false,
    formatTooltip,
    showTooltip = true,
    onValueChange: _onValueChange,
    onChange: _onChange,
    className,
    ...attributes
  } = props;
  const prefix = usePrefix('slider');
  const form = useFormItem(props);
  const track = useRef<HTMLDivElement>(null);
  const current = useRef({
    props,
    form,
    options: { modelValue: value, step, min, max, direction, range },
  });
  current.current = {
    props,
    form,
    options: { modelValue: value, step, min, max, direction, range },
  };
  const [state] = useState(() => {
    const [start, end] = getSliderInitialValues(value, defaultValue);
    return { start, end, rect: undefined as SliderRect | undefined };
  });
  const [, render] = useState(0);
  const refresh = () => render((version) => version + 1);
  const [foundation] = useState((): ReturnType<typeof createSliderFoundation> =>
    createSliderFoundation({
      get options() {
        return current.current.options;
      },
      get start() {
        return state.start;
      },
      get end() {
        return state.end;
      },
      get display() {
        return foundation.getValue();
      },
      get rect() {
        return state.rect;
      },
      isDisabled: () => current.current.form.mergedDisabled,
      setStart: (next) => {
        state.start = next;
        refresh();
      },
      setEnd: (next) => {
        state.end = next;
        refresh();
      },
      measure: () => {
        state.rect = track.current?.getBoundingClientRect();
      },
      onUpdate: (next) => current.current.props.onValueChange?.(next),
      onChange: (next) => current.current.props.onChange?.(next),
      onFormChange: () => current.current.form.eventHandlers?.onChange?.(),
    }),
  );
  const previous = useRef(value);
  useLayoutEffect(() => {
    if (previous.current !== value) {
      previous.current = value;
      foundation.syncModel(value);
    }
  });
  const display = foundation.getValue();
  const markList = getSliderMarks(marks, display);
  const position = (value: number) =>
    getPositionStyle(getOffsetPercent(value, [min, max]), direction);
  const handle = (which: 'start' | 'end') => (
    <SliderHandle
      key={which}
      value={display[which === 'start' ? 0 : 1]}
      min={min}
      max={max}
      direction={direction}
      disabled={form.mergedDisabled}
      formatTooltip={formatTooltip}
      showTooltip={showTooltip}
      style={position(display[which === 'start' ? 0 : 1])}
      onStart={foundation.moveStart}
      onMove={which === 'start' ? foundation.startMoving : foundation.endMoving}
      onKeyDown={(event) => foundation.keydown(which, event)}
    />
  );
  return (
    <div
      {...attributes}
      className={[
        prefix,
        direction === 'vertical' && `${prefix}-vertical`,
        marks && `${prefix}-with-marks`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        ref={track}
        className={[
          `${prefix}-track`,
          form.mergedDisabled && `${prefix}-track-disabled`,
          direction === 'vertical' && `${prefix}-track-vertical`,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={(event) => foundation.click(event.nativeEvent)}
      >
        <div
          className={`${prefix}-bar`}
          style={getSliderBarStyle(display, { min, max, direction })}
        />
        {showTicks && (
          <div className={`${prefix}-ticks`}>
            {getSliderTicks(display, min, max, step).map((item) => (
              <div
                key={item.key}
                style={position(item.key)}
                className={[`${prefix}-tick`, item.isActive && `${prefix}-tick-active`]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </div>
        )}
        {marks && (
          <>
            <div className={`${prefix}-dots`}>
              {markList.map((item) => (
                <div key={item.key} className={`${prefix}-dot-wrapper`} style={position(item.key)}>
                  <div
                    className={[`${prefix}-dot`, item.isActive && `${prefix}-dot-active`]
                      .filter(Boolean)
                      .join(' ')}
                  />
                </div>
              ))}
            </div>
            <div className={`${prefix}-marks`}>
              {markList.map((item) => (
                <div
                  key={item.key}
                  aria-hidden="true"
                  className={`${prefix}-mark`}
                  style={position(item.key)}
                >
                  {item.content}
                </div>
              ))}
            </div>
          </>
        )}
        {range && handle('start')}
        {handle('end')}
      </div>
      {showInput && (
        <div className={`${prefix}-input`}>
          {range && (
            <>
              <InputNumber
                min={min}
                max={max}
                step={step}
                disabled={form.mergedDisabled}
                value={display[0]}
                hideButton
                onChange={(next) => foundation.startChange(getSliderInputValue(next))}
              />
              <div className={`${prefix}-input-hyphens`} />
            </>
          )}
          <InputNumber
            min={min}
            max={max}
            step={step}
            disabled={form.mergedDisabled}
            value={display[1]}
            hideButton
            onChange={(next) => foundation.endChange(getSliderInputValue(next))}
          />
        </div>
      )}
    </div>
  );
}
export default Slider;
