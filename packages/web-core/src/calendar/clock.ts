export function createCalendarClock(adapter: { now: Date }) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const stop = () => {
    clearTimeout(timeout);
    timeout = undefined;
  };
  const tick = () => {
    adapter.now = new Date();
    timeout = setTimeout(tick, 60000);
  };
  return {
    start() {
      if (typeof window === 'undefined') return;
      clearTimeout(timeout);
      adapter.now = new Date();
      timeout = setTimeout(
        tick,
        60000 - (adapter.now.getSeconds() * 1000 + adapter.now.getMilliseconds()),
      );
    },
    stop,
  };
}

export function createCalendarScroll(adapter: {
  config: { timeFrom: number; timeCellHeight: number; timeStep: number };
  scrollTop(value: number): void;
}) {
  const scrollToTime = (minutes: number) => {
    const adjustedMinutes = minutes - adapter.config.timeFrom;
    adapter.scrollTop(
      adjustedMinutes > 0
        ? (adjustedMinutes * adapter.config.timeCellHeight) / adapter.config.timeStep
        : 0,
    );
  };
  return {
    scrollToTime,
    scrollToCurrentTime() {
      const now = new Date();
      scrollToTime(now.getHours() * 60 + now.getMinutes());
    },
    scrollTop() {
      scrollToTime(0);
    },
  };
}
