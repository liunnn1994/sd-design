import { isActivationKey } from '../_utils/keyboard.js';

export interface AlertState {
  visible: boolean;
}

export function createAlertFoundation(
  state: AlertState,
  onClose: (event: Event) => void,
  onAfterClose: () => void,
) {
  const handleClose = (ev: Event) => {
    state.visible = false;
    onClose(ev);
  };

  // role=button 需支持 Enter / Space 激活（关闭按钮键盘可达）
  const onCloseKeydown = (ev: KeyboardEvent) => {
    if (isActivationKey(ev)) {
      ev.preventDefault();
      handleClose(ev);
    }
  };

  const handleAfterLeave = () => {
    onAfterClose();
  };

  return { handleClose, onCloseKeydown, handleAfterLeave };
}
