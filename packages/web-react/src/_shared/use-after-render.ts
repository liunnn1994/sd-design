import { useLayoutEffect, useRef, useState } from 'react';

export function useAfterRender() {
  const [version, setVersion] = useState(0);
  const queue = useRef<{ ticket: number; resolve(): void }[]>([]);
  const requested = useRef(0);
  const mounted = useRef(true);
  const [afterRender] = useState(() => () => {
    if (!mounted.current) return Promise.resolve();
    const ticket = ++requested.current;
    const pending = new Promise<void>((resolve) => queue.current.push({ ticket, resolve }));
    setVersion(ticket);
    return pending;
  });
  useLayoutEffect(() => {
    const completed = queue.current.filter((item) => item.ticket <= version);
    queue.current = queue.current.filter((item) => item.ticket > version);
    completed.forEach((item) => item.resolve());
  }, [version]);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      queue.current.splice(0).forEach((item) => item.resolve());
    };
  }, []);
  return afterRender;
}
