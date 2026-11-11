export function getSpinDelay(delay?: boolean | number) {
  return delay === true ? 400 : Math.max(0, Number(delay) || 0);
}

export function isSpinRequested(hasContent: boolean, loading?: boolean) {
  return hasContent ? Boolean(loading) : true;
}

export function scheduleSpinLoading(
  loading: boolean,
  delay: number,
  setLoading: (value: boolean) => void,
) {
  setLoading(loading && delay === 0);
  const timer = loading && delay > 0 ? setTimeout(() => setLoading(true), delay) : undefined;
  return () => {
    if (timer !== undefined) clearTimeout(timer);
  };
}
