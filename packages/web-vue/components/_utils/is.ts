import type { ComponentPublicInstance, VNodeNormalizedChildren } from 'vue';
import { VNode } from 'vue';

import { Dayjs } from 'dayjs';

const opt = Object.prototype.toString;

export function isArray(obj: unknown): obj is unknown[] {
  return opt.call(obj) === '[object Array]';
}

export function isNull(obj: unknown): obj is null {
  return opt.call(obj) === '[object Null]';
}

export function isBoolean(obj: unknown): obj is boolean {
  return opt.call(obj) === '[object Boolean]';
}

export function isObject<T extends unknown>(
  obj: T,
): obj is unknown extends T ? T & Record<string, unknown> : Extract<T, object> {
  return opt.call(obj) === '[object Object]';
}

export const isPromise = <T>(obj: unknown): obj is Promise<T> => {
  return opt.call(obj) === '[object Promise]';
};

export function isString(obj: unknown): obj is string {
  return opt.call(obj) === '[object String]';
}

export function isNumber(obj: unknown): obj is number {
  return opt.call(obj) === '[object Number]' && obj === obj; // oxlint-disable-line
}

export function isUndefined(obj: unknown): obj is undefined {
  return obj === undefined;
}

export function isFunction<T>(
  obj: T,
): obj is unknown extends T
  ? T & ((...args: unknown[]) => unknown)
  : Extract<T, (...args: never[]) => unknown> {
  return typeof obj === 'function';
}

export function isEmptyObject(obj: unknown): boolean {
  return isObject(obj) && Object.keys(obj).length === 0;
}

export function isExist(obj: unknown): boolean {
  return obj !== undefined && obj !== null;
}

export function isWindow(el: unknown): el is Window {
  // 服务端渲染下没有 window，直接引用会抛 ReferenceError
  return typeof window !== 'undefined' && el === window;
}

export const isComponentInstance = (value: unknown): value is ComponentPublicInstance => {
  return typeof value === 'object' && value !== null && '$' in value && value.$ !== undefined;
};

export const isArrayChildren = (children: VNodeNormalizedChildren): children is VNode[] => {
  return isArray(children);
};

export const isQuarter = (fromat: string) => {
  return /\[Q]Q/.test(fromat);
};

export function isDayjs(time: unknown): time is Dayjs {
  return (
    isObject(time) &&
    '$y' in time &&
    '$M' in time &&
    '$D' in time &&
    '$d' in time &&
    '$H' in time &&
    '$m' in time &&
    '$s' in time
  );
}
