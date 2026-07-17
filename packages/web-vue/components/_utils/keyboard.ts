import { isString } from './is';

export const KEYBOARD_KEY = {
  ENTER: 'Enter',
  ESC: 'Escape',
  BACKSPACE: 'Backspace',
  TAB: 'Tab',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
};

export interface CodeKey {
  /** Keyboard key */
  key: string;
  /** Ctrl / ⌃ */
  ctrl?: boolean;
  /** Shift key */
  shift?: boolean;
  /** Alt / ⌥ */
  alt?: boolean;
  /** meta ⌘ / ⊞ */
  meta?: boolean;
}

const stringifyCodeKey = (k: CodeKey) => {
  return JSON.stringify({
    key: k.key,
    ctrl: Boolean(k.ctrl),
    shift: Boolean(k.shift),
    alt: Boolean(k.alt),
    meta: Boolean(k.meta),
  });
};

/**
 * 是否为「激活键」（Enter / Space）。供 role="button" 等非原生可交互元素复用，
 * 避免在各组件里硬编码 `e.key === 'Enter' || e.key === ' '`（注意 Space 的 key 是 ' '）。
 */
export const isActivationKey = (e: KeyboardEvent): boolean =>
  e.key === KEYBOARD_KEY.ENTER || e.key === KEYBOARD_KEY.SPACE;

/**
 * 生成「Enter / Space 激活」的 keydown 处理器：命中激活键时 preventDefault
 * （避免 Space 触发页面滚动）并调用 `fn`。可选 `guard` 返回 false 时跳过（禁用态等）。
 *
 * @example @keydown="onActivate(handleClose)"
 */
export const onActivate =
  (fn: (e: KeyboardEvent) => void, guard?: (e: KeyboardEvent) => boolean) =>
  (e: KeyboardEvent): void => {
    if (!isActivationKey(e)) return;
    if (guard && !guard(e)) return;
    e.preventDefault();
    fn(e);
  };

export const getKeyDownHandler = (codeKeyMap: Map<CodeKey | string, (e: Event) => void>) => {
  const map: Record<string, (e: Event) => void> = {};

  codeKeyMap.forEach((callback, codeKey) => {
    const _codeKey = isString(codeKey) ? { key: codeKey } : codeKey;
    map[stringifyCodeKey(_codeKey)] = callback;
  });

  return (event: KeyboardEvent): void => {
    const key = stringifyCodeKey({
      key: event.key,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey,
    });
    const callback = map[key];

    if (callback) {
      event.stopPropagation();
      callback(event);
    }
  };
};
