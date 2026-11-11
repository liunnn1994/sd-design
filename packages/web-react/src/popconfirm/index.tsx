import type { BeforeOk } from '@sdata/web-core/dialog/confirmation';
import type { MouseEvent, ReactNode } from 'react';

import { createConfirmationFoundation } from '@sdata/web-core/dialog/confirmation';
import { useLayoutEffect, useRef, useState } from 'react';

import type { ButtonProps } from '../button/index.js';
import type { TriggerProps } from '../trigger/index.js';

import { StatusIcon } from '../_shared/status-icon.js';
import { Button } from '../button/index.js';
import { usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';
import { Trigger } from '../trigger/index.js';

export interface PopconfirmProps extends Omit<TriggerProps, 'trigger' | 'onCancel'> {
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okLoading?: boolean;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  onBeforeOk?: BeforeOk;
  onBeforeCancel?: () => boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

function invokeButtonClick(
  props: ButtonProps | undefined,
  event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
) {
  if (props?.href !== undefined) props.onClick?.(event as MouseEvent<HTMLAnchorElement>);
  else props?.onClick?.(event as MouseEvent<HTMLButtonElement>);
}

export function Popconfirm({
  children,
  content,
  type = 'info',
  icon,
  okText,
  cancelText,
  okLoading = false,
  okButtonProps,
  cancelButtonProps,
  onBeforeOk,
  onBeforeCancel,
  onOk,
  onCancel,
  popupVisible,
  defaultPopupVisible = false,
  onPopupVisibleChange,
  position = 'top',
  className,
  contentClass,
  arrowClass,
  ...attrs
}: PopconfirmProps) {
  const prefix = usePrefix('popconfirm');
  const { t } = useI18n();
  const [localVisible, setLocalVisible] = useState(defaultPopupVisible);
  const [localLoading, setLocalLoading] = useState(false);
  const live = useRef({
    onBeforeOk,
    onBeforeCancel,
    onOk,
    onCancel,
    onPopupVisibleChange,
    localLoading,
    okLoading,
  });
  live.current = {
    onBeforeOk,
    onBeforeCancel,
    onOk,
    onCancel,
    onPopupVisibleChange,
    localLoading,
    okLoading,
  };
  const [foundation] = useState(() =>
    createConfirmationFoundation<[]>({
      get callbacks() {
        return live.current;
      },
      get loading() {
        return live.current.localLoading;
      },
      setLoading(value) {
        live.current.localLoading = value;
        setLocalLoading(value);
      },
      setVisible: setLocalVisible,
      onVisibleChange: (value) => live.current.onPopupVisibleChange?.(value),
      onOk: () => live.current.onOk?.(),
      onCancel: () => live.current.onCancel?.(),
    }),
  );
  const visible = popupVisible ?? localVisible;
  useLayoutEffect(() => {
    if (!visible) foundation.invalidate();
  }, [foundation, visible]);
  useLayoutEffect(() => () => foundation.invalidate(), [foundation]);
  return (
    <Trigger
      popupOffset={10}
      showArrow
      animationName="zoom-in-fade-out"
      autoFitTransformOrigin
      escToClose
      ariaHasPopup="dialog"
      role="dialog"
      {...attrs}
      className={[prefix, className].filter(Boolean).join(' ')}
      trigger="click"
      position={position}
      popupVisible={visible}
      onPopupVisibleChange={foundation.changeVisible}
      contentClass={[`${prefix}-popup-content`, contentClass].filter(Boolean).join(' ')}
      arrowClass={[`${prefix}-popup-arrow`, arrowClass].filter(Boolean).join(' ')}
      content={
        <>
          <div className={`${prefix}-body`}>
            <span className={`${prefix}-icon`}>
              {icon === undefined ? <StatusIcon type={type} /> : icon}
            </span>
            <span className={`${prefix}-content`}>{content}</span>
          </div>
          <div className={`${prefix}-footer`}>
            <Button
              size="mini"
              {...cancelButtonProps}
              onClick={(event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
                invokeButtonClick(cancelButtonProps, event);
                foundation.cancel();
              }}
            >
              {cancelText || t('popconfirm.cancelText')}
            </Button>
            <Button
              type="primary"
              size="mini"
              {...okButtonProps}
              loading={okLoading || localLoading}
              onClick={(event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
                if (live.current.localLoading || live.current.okLoading) return;
                invokeButtonClick(okButtonProps, event);
                void foundation.ok();
              }}
            >
              {okText || t('popconfirm.okText')}
            </Button>
          </div>
        </>
      }
    >
      {children}
    </Trigger>
  );
}

export default Popconfirm;
