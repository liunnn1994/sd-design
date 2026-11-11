import type { BeforeOk } from '@sdata/web-core/dialog/confirmation';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode, MouseEvent } from 'react';

import { onActivate } from '@sdata/web-core/_utils/keyboard';
import { clickDrawerMask } from '@sdata/web-core/dialog/foundation';
import { applyDrawerLayout } from '@sdata/web-core/dialog/layout';
import { useId } from 'react';
import { createPortal } from 'react-dom';

import { useDialog } from '../_shared/use-dialog.js';
import { Button, type ButtonProps } from '../button/index.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Ellipsis, type EllipsisProps } from '../ellipsis/index.js';
import { useI18n } from '../locale/index.js';
import { openDrawer } from './imperative.js';
export type { DrawerConfig, DrawerMethod, DrawerReturn, DrawerUpdateConfig } from './imperative.js';

export interface DrawerProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'title' | 'onCancel' | 'onClose'
> {
  visible?: boolean;
  defaultVisible?: boolean;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  title?: ReactNode;
  titleEllipsisTooltip?: EllipsisProps['tooltip'];
  mask?: boolean;
  maskClosable?: boolean;
  closable?: boolean;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okLoading?: boolean;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  unmountOnClose?: boolean;
  width?: number | string;
  height?: number | string;
  popupContainer?: string | HTMLElement;
  drawerStyle?: CSSProperties;
  bodyClass?: string | string[];
  bodyStyle?: CSSProperties;
  onBeforeOk?: BeforeOk;
  onBeforeCancel?: () => boolean;
  escToClose?: boolean;
  renderToBody?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  hideCancel?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onOk?: (event: Event) => void;
  onCancel?: (event: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onBeforeOpen?: () => void;
  onBeforeClose?: () => void;
}

export function DrawerView(props: DrawerProps) {
  const config = useConfig();
  const prefix = usePrefix('drawer');
  const iconPrefix = usePrefix('icon-hover');
  const { t } = useI18n();
  const {
    visible: controlled,
    defaultVisible = false,
    placement = 'right',
    title,
    titleEllipsisTooltip = true,
    mask = true,
    maskClosable = true,
    closable = true,
    okText,
    cancelText,
    okLoading = false,
    okButtonProps,
    cancelButtonProps,
    unmountOnClose = false,
    width = 250,
    height = 250,
    popupContainer = 'body',
    drawerStyle,
    bodyClass,
    bodyStyle,
    onBeforeOk,
    onBeforeCancel,
    escToClose = true,
    renderToBody = true,
    header = true,
    footer = true,
    hideCancel = false,
    onVisibleChange,
    onOk,
    onCancel,
    onOpen,
    onClose,
    onBeforeOpen,
    onBeforeClose,
    children,
    className,
    style,
    ...attrs
  } = { ...config.drawer, ...props };
  const id = useId();
  const {
    visible,
    mounted,
    container,
    portalContainer,
    loading,
    zIndex,
    dialogRef: drawerRef,
    maskRef,
    controller,
  } = useDialog({
    visible: controlled,
    defaultVisible,
    popupContainer,
    renderToBody,
    escToClose,
    animationName: `slide-${placement}-drawer`,
    transitionKey: placement,
    maskAnimationName: 'fade-drawer',
    closeSelector: '[data-drawer-close]',
    onBeforeOk,
    onBeforeCancel,
    onVisibleChange,
    onOk,
    onCancel,
    onOpen,
    onClose,
    onBeforeOpen,
    onBeforeClose,
  });
  if (!container || !portalContainer || (unmountOnClose && !visible && !mounted)) return null;
  const cancel = controller.confirmation.cancel;
  const content = (
    <div
      {...attrs}
      className={[`${prefix}-container`, !mask && `${prefix}-penetrable`, className]
        .filter(Boolean)
        .join(' ')}
      style={{
        ...(container === document.body ? { zIndex } : { zIndex: 'inherit', position: 'absolute' }),
        ...style,
        display: visible || mounted ? undefined : 'none',
      }}
    >
      {mask && (
        <div
          ref={maskRef}
          className={`${prefix}-mask`}
          onClick={(event) => clickDrawerMask(maskClosable, event.nativeEvent, cancel)}
        />
      )}
      <div
        ref={drawerRef}
        className={prefix}
        style={applyDrawerLayout({ [placement]: 0, ...drawerStyle }, placement, width, height)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={header === true && title ? `${id}-title` : undefined}
        aria-describedby={`${id}-body`}
        tabIndex={-1}
      >
        {header !== false && header != null && (
          <div className={`${prefix}-header`}>
            {header === true ? (
              <>
                {title && (
                  <div id={`${id}-title`} className={`${prefix}-title`}>
                    <Ellipsis className={`${prefix}-title-text`} tooltip={titleEllipsisTooltip}>
                      {title}
                    </Ellipsis>
                  </div>
                )}
                {closable && (
                  <div
                    data-drawer-close
                    tabIndex={0}
                    role="button"
                    aria-label={t('a11y.close')}
                    className={`${prefix}-close-btn`}
                    onClick={(event) => cancel(event.nativeEvent)}
                    onKeyDown={(event) => onActivate(cancel)(event.nativeEvent)}
                  >
                    <span className={iconPrefix}>
                      <svg
                        viewBox="0 0 48 48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        width="1em"
                        height="1em"
                        aria-hidden="true"
                      >
                        <path d="m12 12 24 24M12 36l24-24" />
                      </svg>
                    </span>
                  </div>
                )}
              </>
            ) : (
              header
            )}
          </div>
        )}
        <div
          id={`${id}-body`}
          className={[`${prefix}-body`, ...(Array.isArray(bodyClass) ? bodyClass : [bodyClass])]
            .filter(Boolean)
            .join(' ')}
          style={bodyStyle}
        >
          {children}
        </div>
        {footer !== false && footer != null && (
          <div className={`${prefix}-footer`}>
            {footer === true ? (
              <>
                {!hideCancel && (
                  <Button
                    {...cancelButtonProps}
                    onClick={(event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) =>
                      cancel(event.nativeEvent)
                    }
                  >
                    {cancelText || t('drawer.cancelText')}
                  </Button>
                )}
                <Button
                  type="primary"
                  loading={okLoading || loading}
                  {...okButtonProps}
                  onClick={(event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
                    void controller.confirmation.ok(event.nativeEvent);
                  }}
                >
                  {okText || t('drawer.okText')}
                </Button>
              </>
            ) : (
              footer
            )}
          </div>
        )}
      </div>
    </div>
  );
  return renderToBody ? createPortal(content, portalContainer) : content;
}

export const Drawer = Object.assign(DrawerView, { open: openDrawer });
export default Drawer;

export type DrawerInstance = ReactComponentRef<typeof Drawer>;
