import { onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';

import { off, on } from '../_utils/dom';
import { KEYBOARD_KEY } from '../_utils/keyboard';

/**
 * 可聚焦元素选择器（排除显式 tabindex="-1" 由 isFocusableElement 再过滤）
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'iframe',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const isFocusableElement = (el: HTMLElement): boolean => {
  if (el.hasAttribute('disabled')) return false;
  if (el.getAttribute('tabindex') === '-1') return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
};

/**
 * 取容器内当前可见、可聚焦的元素列表（顺序即 DOM 顺序）。
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return Array.from(nodes).filter(isFocusableElement);
};

export interface UseFocusTrapOptions {
  /**
   * 激活时的首焦元素选择器。调用方可返回一个容器内应优先聚焦的元素
   * （如对话框避开 close 按钮、聚焦首个主要操作）；返回 null/undefined 则用默认（首个可聚焦元素）。
   */
  initialFocus?: (container: HTMLElement) => HTMLElement | null | undefined;
}

export interface UseFocusTrapReturn {
  /** 激活：缓存当前焦点 → 绑定 Tab 拦截 → 聚焦容器内首个可聚焦元素 */
  activate: () => void;
  /** 失活：解绑 Tab 拦截 → 把焦点还原到激活前的元素 */
  deactivate: () => void;
}

/**
 * 对话框/抽屉等弹层的焦点陷阱。
 *
 * - activate 时缓存 `document.activeElement`（通常是触发器），并把焦点移入容器；
 * - 激活期间 Tab / Shift+Tab 在容器内循环，不会逃逸到背后的页面；
 * - deactivate 时还原焦点到触发器。
 *
 * 不自动监听可见性，调用方应在弹层的 open/close 时机（如 transition 的
 * after-enter / after-leave）显式调用 activate / deactivate。
 */
export const useFocusTrap = (
  containerRef: Ref<HTMLElement | undefined>,
  options?: UseFocusTrapOptions,
): UseFocusTrapReturn => {
  let savedFocus: HTMLElement | null = null;

  const handleKeydown = (ev: KeyboardEvent) => {
    if (ev.key !== KEYBOARD_KEY.TAB) return;
    const container = containerRef.value;
    if (!container) return;

    const focusables = getFocusableElements(container);
    if (focusables.length === 0) {
      ev.preventDefault();
      container.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    // 容器自身获焦（如用户点击弹层空白处）时也视作两端：Shift+Tab 回末项，Tab 进首项，
    // 否则默认 Tab 会把焦点带出弹层（container.contains(container) 恒为 true 会漏掉这一情形）。
    const atEdge = (el: Element | null) => !container.contains(el) || el === container;

    if (ev.shiftKey) {
      if (active === first || atEdge(active)) {
        ev.preventDefault();
        last.focus();
      }
    } else if (active === last || atEdge(active)) {
      ev.preventDefault();
      first.focus();
    }
  };

  let focusRetryHandle = 0;

  const focusIntoContainer = (): boolean => {
    const container = containerRef.value;
    if (!container) return false;
    // 调用方可指定首焦元素（如对话框避开 close 按钮，聚焦首个主要操作）
    const preferred = options?.initialFocus?.(container);
    if (preferred) {
      preferred.focus();
      if (document.activeElement === preferred) return true;
    }
    const focusables = getFocusableElements(container);
    if (focusables.length > 0) {
      focusables[0].focus();
      return true;
    }
    // 无可聚焦子元素时退而聚焦容器本身（容器需设 tabindex 才能被聚焦）
    container.focus();
    return document.activeElement === container;
  };

  const activate = () => {
    savedFocus = (document.activeElement as HTMLElement) ?? null;
    on(document.documentElement, 'keydown', handleKeydown, true);
    if (focusIntoContainer()) return;
    // 过渡期间元素可能尚未可聚焦，下一帧重试，直到成功
    const retry = () => {
      if (focusIntoContainer()) return;
      focusRetryHandle = requestAnimationFrame(retry);
    };
    focusRetryHandle = requestAnimationFrame(retry);
  };

  const deactivate = () => {
    if (focusRetryHandle) {
      cancelAnimationFrame(focusRetryHandle);
      focusRetryHandle = 0;
    }
    off(document.documentElement, 'keydown', handleKeydown, true);
    const target = savedFocus;
    savedFocus = null;
    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  };

  onBeforeUnmount(deactivate);

  return { activate, deactivate };
};
