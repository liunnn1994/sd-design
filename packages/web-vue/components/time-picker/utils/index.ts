import BTween from 'b-tween';
import { Dayjs } from 'dayjs';

import { dayjs } from '../../_utils/date';
import { isArray, isUndefined, isDayjs } from '../../_utils/is';
import { TimePickerProps } from '../interface';

export function getColumnsFromFormat(format: string) {
  const tokens = format.replace(/\[[^\]]*]/g, '');
  const units = ['H', 'h', 'm', 's', 'a', 'A'];
  const list: string[] = [];
  let use12Hours = false;
  units.forEach((unit) => {
    if (tokens.indexOf(unit) !== -1) {
      list.push(unit);
      if (unit === 'a' || unit === 'A') {
        use12Hours = true;
      }
    }
  });
  return {
    list,
    use12Hours,
  };
}

const scrollIds = new WeakMap<HTMLElement, number>();
const scrollTweens = new WeakMap<HTMLElement, InstanceType<typeof BTween>>();

export function scrollTo(element: HTMLElement, to: number, duration: number) {
  const scrollId = scrollIds.get(element);
  if (!isUndefined(scrollId)) {
    cancelAnimationFrame(scrollId);
  }
  // 连点切换时间时，上一段滚动动画可能还在跑；不先停掉的话两个 tween 会同时写
  // scrollTop，滚动过程出现抖动（与 BackTop 的处理保持一致）。
  scrollTweens.get(element)?.stop();
  scrollTweens.delete(element);

  if (duration <= 0) {
    element.scrollTop = to;
    return;
  }

  scrollIds.set(
    element,
    requestAnimationFrame(() => {
      const tween = new BTween({
        from: { scrollTop: element.scrollTop },
        to: { scrollTop: to },
        duration,
        onUpdate: (keys: Record<string, number>) => {
          element.scrollTop = keys.scrollTop;
        },
      });
      scrollTweens.set(element, tween);
      tween.start();
    }),
  );
}

export function getFormattedValue(time: Dayjs, format: string): string;
export function getFormattedValue(time: Dayjs | undefined, format: string): string | undefined;
export function getFormattedValue(
  time: Array<Dayjs | undefined> | undefined,
  format: string,
): Array<string | undefined> | undefined;
export function getFormattedValue(
  time: Dayjs | Array<Dayjs | undefined> | undefined,
  format: string,
): string | Array<string | undefined> | undefined;
export function getFormattedValue(
  time: Dayjs | Array<Dayjs | undefined> | undefined,
  format: string,
): string | Array<string | undefined> | undefined {
  const formatValue = (
    time: Dayjs | Array<Dayjs | undefined> | undefined,
  ): string | Array<string | undefined> | undefined => {
    if (isArray(time)) {
      return time.map((t) => formatValue(t)) as Array<string | undefined>;
    }

    if (isUndefined(time)) return undefined;

    return time.format(format);
  };

  return formatValue(time);
}

export function isValidRangeValue(value: unknown): value is undefined | Dayjs[] {
  if (isUndefined(value)) return true;
  if (!isArray(value)) return false;
  return value.length === 0 || (value.length === 2 && isDayjs(value[0]) && isDayjs(value[1]));
}

export function isValidInputValue(time: string, format: string): boolean {
  if (!time) return false;

  return typeof time === 'string' && dayjs(time, format).format(format) === time;
}

export function isDisabledTime(
  value: Dayjs | undefined,
  {
    disabledHours,
    disabledMinutes,
    disabledSeconds,
  }: {
    disabledHours: TimePickerProps['disabledHours'];
    disabledMinutes: TimePickerProps['disabledMinutes'];
    disabledSeconds: TimePickerProps['disabledSeconds'];
  },
) {
  if (!value) return false;

  const hour = value.hour();
  const minute = value.minute();
  const second = value.second();

  const disabledHourList = disabledHours?.() || [];
  const disabledMinuteList = disabledMinutes?.(hour) || [];
  const disabledSecondList = disabledSeconds?.(hour, minute) || [];

  const isDisabledItem = (num: number | undefined, disabledList: number[]) => {
    return !isUndefined(num) && disabledList.includes(num);
  };

  return (
    isDisabledItem(hour, disabledHourList) ||
    isDisabledItem(minute, disabledMinuteList) ||
    isDisabledItem(second, disabledSecondList)
  );
}
