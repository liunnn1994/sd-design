import { runCssTransition } from '@sdata/web-core/transition/css';
import { useLayoutEffect, useRef, useState } from 'react';

export function useTransitionPresence(
  visible: boolean,
  element: HTMLElement | null,
  name: string,
  duration: number | { enter: number; leave: number } | undefined,
  onShow: () => void,
  onHide: () => void,
) {
  const [present, setPresent] = useState(visible);
  const [animating, setAnimating] = useState(false);
  const wasVisible = useRef(visible);
  const callbacks = useRef({ onShow, onHide });
  callbacks.current = { onShow, onHide };
  const enterDuration = typeof duration === 'number' ? duration : duration?.enter;
  const leaveDuration = typeof duration === 'number' ? duration : duration?.leave;
  useLayoutEffect(() => {
    if (!element) return;
    if (!visible && !wasVisible.current) return;
    if (visible) wasVisible.current = true;
    setAnimating(true);
    if (visible) setPresent(true);
    return runCssTransition(element, {
      name,
      enter: visible,
      duration: visible ? enterDuration : leaveDuration,
      finish() {
        setAnimating(false);
        setPresent(visible);
        wasVisible.current = visible;
        if (visible) callbacks.current.onShow();
        else callbacks.current.onHide();
      },
    });
  }, [visible, element, name, enterDuration, leaveDuration]);
  return { present: visible || present, animating };
}
