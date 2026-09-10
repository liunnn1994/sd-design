const target = typeof window === 'undefined' ? global : window;

export function debounce<T extends unknown[]>(callback: (...args: T) => void, delay: number) {
  let timer = 0;
  const debounced = (...args: T) => {
    if (timer) {
      target.clearTimeout(timer);
    }
    timer = target.setTimeout(() => {
      timer = 0;
      callback(...args);
    }, delay) as unknown as number;
  };

  debounced.cancel = () => {
    if (timer) {
      target.clearTimeout(timer);
      timer = 0;
    }
  };

  return debounced;
}
