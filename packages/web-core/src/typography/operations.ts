import { isActivationKey } from '../_utils/keyboard.js';
export function getTypographyShowExpand(
  forceRenderExpand: boolean,
  expandable: boolean,
  isEllipsis: boolean,
) {
  return forceRenderExpand || (expandable && isEllipsis);
}
export function createTypographyOperations(callbacks: {
  edit(): void;
  copy(): void;
  expand(): void;
}) {
  function onEditClick() {
    callbacks.edit();
  }
  function onCopyClick() {
    callbacks.copy();
  }
  function onExpandClick() {
    callbacks.expand();
  }

  // 三个 role=button 控件的键盘激活（图标/无 href 的 a 无原生按钮语义）
  function onEditKeydown(ev: KeyboardEvent) {
    if (isActivationKey(ev)) {
      ev.preventDefault();
      onEditClick();
    }
  }
  function onCopyKeydown(ev: KeyboardEvent) {
    if (isActivationKey(ev)) {
      ev.preventDefault();
      onCopyClick();
    }
  }
  function onExpandKeydown(ev: KeyboardEvent) {
    if (isActivationKey(ev)) {
      ev.preventDefault();
      onExpandClick();
    }
  }
  return { onEditClick, onCopyClick, onExpandClick, onEditKeydown, onCopyKeydown, onExpandKeydown };
}
