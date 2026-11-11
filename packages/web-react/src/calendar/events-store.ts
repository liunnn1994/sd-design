import type { CalendarEventsHost } from '@sdata/web-core/calendar/events-host';

import { createCalendarEvents } from '@sdata/web-core/calendar/events';

import type { CalendarEvent } from './types.js';

export function createCalendarEventsStore(host: CalendarEventsHost) {
  const listeners = new Set<() => void>();
  const proxies = new WeakMap<object, object>();
  let events = host.config.events;
  let version = 0;
  let pending = false;
  let disposed = false;
  let indexDirty = false;
  let rebuild = () => {};
  let cleanup = () => {};
  function changed(target: object) {
    if (disposed) return;
    version++;
    if (target === events) indexDirty = true;
    if (pending) return;
    pending = true;
    queueMicrotask(() => {
      if (disposed) return;
      if (indexDirty) {
        indexDirty = false;
        rebuild();
      }
      pending = false;
      listeners.forEach((listener) => listener());
    });
  }
  function observe<T extends object>(value: T, shallow = false): T {
    if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype) return value;
    const cached = proxies.get(value);
    if (cached) return cached as T;
    const proxy = new Proxy(value, {
      get(target, key, receiver) {
        const next = Reflect.get(target, key, receiver);
        return !shallow && next && typeof next === 'object' ? observe(next) : next;
      },
      set(target, key, next, receiver) {
        const previous = Reflect.get(target, key, receiver);
        const result = Reflect.set(target, key, next, receiver);
        if (result && !Object.is(previous, next)) changed(target);
        return result;
      },
      deleteProperty(target, key) {
        const existed = Reflect.has(target, key);
        const result = Reflect.deleteProperty(target, key);
        if (result && existed) changed(target);
        return result;
      },
    });
    proxies.set(value, proxy);
    proxies.set(proxy, proxy);
    return proxy;
  }
  const config = new Proxy(host.config, {
    get(target, key) {
      return key === 'events' ? observe(events) : Reflect.get(target, key);
    },
  });
  const manager = createCalendarEvents(
    { ...host, config },
    {
      createState: (state) => observe(state),
      createIndex: (state) => observe(state, true),
      observeEvents(callback) {
        rebuild = callback;
        callback();
      },
      onDispose(callback) {
        cleanup = callback;
      },
    },
  );
  return {
    manager,
    get events() {
      return observe(events);
    },
    getSnapshot: () => version,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    replaceEvents(next: CalendarEvent[]) {
      events = next;
      indexDirty = true;
      changed(events);
    },
    dispose() {
      disposed = true;
      listeners.clear();
      cleanup();
    },
  };
}
