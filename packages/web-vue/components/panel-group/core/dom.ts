// DOM 辅助：填充面板/伸缩杆标记、RTL、body 滚动锁定。移植自 vendor/motion-panels 的 core/dom.ts。
export const FILL_ATTRIBUTE = 'data-sd-panels-fill';
export const SEPARATOR_ATTRIBUTE = 'data-sd-panels-separator';

export const isRtl = (element: Element | null) =>
  !!element && getComputedStyle(element).direction === 'rtl';

export const isSeparator = (node: Element | null) =>
  node?.hasAttribute(SEPARATOR_ATTRIBUTE) ?? false;

export const hasFillAfter = (node: Element | null): boolean => {
  const next = node?.nextElementSibling;

  return !!next && (next.hasAttribute(FILL_ATTRIBUTE) || hasFillAfter(next));
};

let locks = 0;
let saved: Partial<CSSStyleDeclaration> = {};

export const lockBody = (cursor: string, onEscape: () => void) => {
  const { style } = document.body;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape();
    }
  };
  if (locks === 0) {
    saved = {
      cursor: style.cursor,
      userSelect: style.userSelect,
      webkitUserSelect: style.webkitUserSelect,
    };
  }
  // 引用计数：多个面板同时拖拽时共享一次 body 锁定
  locks += 1;
  Object.assign(style, { cursor, userSelect: 'none', webkitUserSelect: 'none' });
  addEventListener('keydown', onKeyDown, true);

  return () => {
    locks -= 1;
    if (locks === 0) {
      Object.assign(style, saved);
    }
    removeEventListener('keydown', onKeyDown, true);
  };
};
