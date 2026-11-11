import { createPopupWrapperFoundation } from '@sdata/web-core/trigger/compat-state';
import { useRef, useState } from 'react';

export function usePopupVisible(
  popupVisible: boolean | undefined,
  defaultPopupVisible: boolean,
  onPopupVisibleChange: ((visible: boolean) => void) | undefined,
) {
  const [localVisible, setLocalVisible] = useState(defaultPopupVisible);
  const live = useRef({ popupVisible, localVisible, onPopupVisibleChange });
  live.current = { popupVisible, localVisible, onPopupVisibleChange };
  return useState(() =>
    createPopupWrapperFoundation(
      {
        get popupVisible() {
          return live.current.popupVisible;
        },
        get localVisible() {
          return live.current.localVisible;
        },
        set localVisible(next) {
          live.current.localVisible = next;
          setLocalVisible(next);
        },
      },
      () => {},
      (visible) => live.current.onPopupVisibleChange?.(visible),
    ),
  )[0];
}
