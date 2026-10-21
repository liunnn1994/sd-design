import { isNumber } from '../_utils/is.js';
import { KEYBOARD_KEY } from '../_utils/keyboard.js';

export interface DropdownPanelState {
  readonly list: HTMLElement | undefined;
  readonly bottomOffset: number;
  readonly trigger: string | string[];
  readonly isHoverTrigger: boolean;
  readonly popupMaxHeight: boolean | number | undefined;
}
export interface DropdownPanelEnvironment {
  readonly activeElement: Element | null;
  isElement(value: unknown): value is HTMLElement;
  requestFrame(callback: FrameRequestCallback): number;
  cancelFrame(frame: number): void;
}
export type DropdownPanelStyle = {
  maxHeight: string;
  overflowY?: 'hidden';
};
export function createDropdownPanelFoundation(
  state: DropdownPanelState,
  environment: DropdownPanelEnvironment,
  onScroll: (event: Event) => void,
  onReachBottom: (event: Event) => void,
) {
  const handleScroll = (e: Event) => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target as HTMLElement;
    const bottom = scrollHeight - (scrollTop + offsetHeight);
    if (bottom <= state.bottomOffset) {
      onReachBottom(e);
    }
    onScroll(e);
  };

  // 菜单键盘导航：方向键 / Home / End 在 menuitem 间移动，Enter/Space 激活
  const getMenuitems = (): HTMLElement[] => {
    if (!state.list) return [];
    return Array.from(state.list.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
      (el) => el.getAttribute('aria-disabled') !== 'true',
    );
  };

  const focusMenuitem = (dir: 'next' | 'prev' | 'first' | 'last') => {
    const items = getMenuitems();
    if (items.length === 0) return;
    const current = items.findIndex((el) => el === environment.activeElement);
    let target = 0;
    if (dir === 'first') target = 0;
    else if (dir === 'last') target = items.length - 1;
    else if (dir === 'next') target = current < 0 ? 0 : (current + 1) % items.length;
    else target = current <= 0 ? items.length - 1 : current - 1;
    items[target]?.focus();
  };

  const handleKeydown = (ev: KeyboardEvent) => {
    const target = ev.target;
    if (
      environment.isElement(target) &&
      (target.isContentEditable || target.closest('input, textarea, select'))
    ) {
      return;
    }
    switch (ev.key) {
      case KEYBOARD_KEY.ARROW_DOWN:
        ev.preventDefault();
        focusMenuitem('next');
        break;
      case KEYBOARD_KEY.ARROW_UP:
        ev.preventDefault();
        focusMenuitem('prev');
        break;
      case KEYBOARD_KEY.HOME:
        ev.preventDefault();
        focusMenuitem('first');
        break;
      case KEYBOARD_KEY.END:
        ev.preventDefault();
        focusMenuitem('last');
        break;
      case KEYBOARD_KEY.ENTER:
      case KEYBOARD_KEY.SPACE:
        ev.preventDefault();
        if (environment.isElement(environment.activeElement)) {
          environment.activeElement.click();
        }
        break;
    }
  };

  const getIsHoverTrigger = () => {
    const trigger = state.trigger;
    return Array.isArray(trigger) ? trigger.includes('hover') : trigger === 'hover';
  };
  let focusFrame = 0;
  const destroy = () => environment.cancelFrame(focusFrame);
  const focusOnMount = (schedule: (callback: () => void) => unknown) => {
    // 面板随弹出层挂载即打开：把焦点放进首个可操作项，键盘用户立即可用。
    // 但 hover 触发属于被动展开（鼠标移入），不应抢走键盘焦点/触发滚动，故跳过。
    if (state.isHoverTrigger) return;
    const focusFirst = () => {
      const items = getMenuitems();
      const target = items[0] ?? state.list;
      if (!target) return;
      target.focus();
      if (environment.activeElement !== target) {
        focusFrame = environment.requestFrame(focusFirst);
      }
    };
    schedule(focusFirst);
  };
  const getStyle = (): DropdownPanelStyle | undefined => {
    if (isNumber(state.popupMaxHeight)) {
      return {
        maxHeight: `${state.popupMaxHeight}px`,
      };
    }
    if (!state.popupMaxHeight) {
      return {
        maxHeight: 'none',
        overflowY: 'hidden',
      };
    }
    return undefined;
  };
  return { handleScroll, handleKeydown, getIsHoverTrigger, getStyle, focusOnMount, destroy };
}
