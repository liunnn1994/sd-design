function maxDuration(durations: string, delays: string) {
  const parse = (value: string) =>
    value
      .split(',')
      .map((item) => Number.parseFloat(item) * (item.trim().endsWith('ms') ? 1 : 1000) || 0);
  const duration = parse(durations);
  const delay = parse(delays);
  return Math.max(0, ...duration.map((value, index) => value + delay[index % delay.length]));
}

export function runCssTransition(
  element: HTMLElement,
  options: { name: string; enter: boolean; duration?: number | undefined; finish(): void },
) {
  const phase = options.enter ? 'enter' : 'leave';
  const from = `${options.name}-${phase}-from`;
  const active = `${options.name}-${phase}-active`;
  const to = `${options.name}-${phase}-to`;
  let frame = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cleanup = () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    element.classList.remove(from, active, to);
  };
  if (!options.name || options.duration === 0) {
    options.finish();
    return cleanup;
  }
  element.classList.add(from);
  element.getBoundingClientRect();
  element.classList.add(active);
  frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => {
      element.classList.remove(from);
      element.classList.add(to);
      const style = getComputedStyle(element);
      const duration =
        options.duration ??
        Math.max(
          maxDuration(style.transitionDuration, style.transitionDelay),
          maxDuration(style.animationDuration, style.animationDelay),
        );
      timer = setTimeout(() => {
        cleanup();
        options.finish();
      }, duration + 1);
    });
  });
  return cleanup;
}
