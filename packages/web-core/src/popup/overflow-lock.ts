type OverflowStyles = Partial<Pick<CSSStyleDeclaration, 'overflow' | 'width' | 'boxSizing'>>;

const locks = new WeakMap<HTMLElement, { owners: number; originStyle: OverflowStyles }>();

export function acquireOverflowLock(element: HTMLElement, styles: OverflowStyles | undefined) {
  const existing = locks.get(element);
  if (existing) {
    existing.owners++;
    return true;
  }
  if (!styles || element.style.overflow === 'hidden') return false;
  const originStyle: OverflowStyles = {};
  for (const [key, value] of Object.entries(styles) as [keyof OverflowStyles, string][]) {
    originStyle[key] = element.style[key];
    element.style[key] = value;
  }
  locks.set(element, { owners: 1, originStyle });
  return true;
}

export function releaseOverflowLock(element: HTMLElement) {
  const lock = locks.get(element)!;
  if (--lock.owners === 0) {
    for (const [key, value] of Object.entries(lock.originStyle) as [
      keyof OverflowStyles,
      string,
    ][]) {
      element.style[key] = value;
    }
    locks.delete(element);
  }
}
