import type { MouseEvent } from 'react';

import { onActivate } from '@sdata/web-core/_utils/keyboard';
import { createDialogDrag } from '@sdata/web-core/dialog/drag';
import { createDialogMask } from '@sdata/web-core/dialog/foundation';
import { applyModalLayout } from '@sdata/web-core/dialog/layout';
import { useContext, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { ModalProps } from './types.js';

import { StatusIcon } from '../_shared/status-icon.js';
import { useDialog } from '../_shared/use-dialog.js';
import { Button } from '../button/index.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { ThemeContext } from '../config-provider/theme-provider.js';
import { Ellipsis } from '../ellipsis/index.js';
import { useI18n } from '../locale/index.js';

export function ModalView(props: ModalProps) {
  const config = useConfig();
  const theme = useContext(ThemeContext);
  const prefix = usePrefix('modal');
  const icon = usePrefix('icon');
  const { t } = useI18n();
  const {
    visible: controlled,
    defaultVisible = false,
    width,
    top,
    mask = true,
    title,
    titleEllipsisTooltip = true,
    titleAlign = 'center',
    alignCenter = true,
    unmountOnClose = false,
    maskClosable = true,
    hideCancel = false,
    simple = false,
    closable = true,
    okText,
    cancelText,
    okLoading = false,
    okButtonProps,
    cancelButtonProps,
    footer = true,
    renderToBody = true,
    popupContainer = 'body',
    maskStyle,
    modalClass,
    modalStyle,
    onBeforeOk,
    onBeforeCancel,
    escToClose = true,
    draggable = false,
    fullscreen = false,
    maskAnimationName = fullscreen ? 'fade-in-standard' : 'fade-modal',
    modalAnimationName = fullscreen ? 'zoom-in' : 'zoom-modal',
    bodyClass,
    bodyStyle,
    messageType,
    hideTitle = false,
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
  } = { ...config.modal, ...props };
  const wrapper = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<[number, number]>();
  const live = useRef({ mask, maskClosable, draggable: draggable && !fullscreen, alignCenter });
  live.current = { mask, maskClosable, draggable: draggable && !fullscreen, alignCenter };
  const guards = useRef<{ reset(): void } | null>(null);
  const dialog = useDialog({
    visible: controlled,
    defaultVisible,
    popupContainer,
    renderToBody,
    escToClose,
    animationName: modalAnimationName,
    maskAnimationName,
    closeSelector: '[data-modal-close]',
    onBeforeOk,
    onBeforeCancel,
    onVisibleChange,
    onOk,
    onCancel,
    onOpen,
    onClose,
    onBeforeOpen,
    onBeforeClose,
    beforeOpening: () => guards.current?.reset(),
    beforeClosed: () => {
      if (live.current.draggable) setPosition(undefined);
    },
  });
  const {
    visible,
    mounted,
    container,
    portalContainer,
    zIndex,
    loading,
    dialogRef,
    maskRef,
    controller,
  } = dialog;
  const [maskControl] = useState(() =>
    createDialogMask({
      get mask() {
        return live.current.mask;
      },
      get closable() {
        return live.current.maskClosable;
      },
      isMaskTarget: (event) => event.target === maskRef.current,
      isWrapperTarget: (event) => event.target === wrapper.current,
      cancel: controller.confirmation.cancel,
    }),
  );
  guards.current = maskControl;
  const [drag] = useState(() =>
    createDialogDrag({
      get modal() {
        return dialogRef.current ?? undefined;
      },
      get wrapper() {
        return wrapper.current ?? undefined;
      },
      get draggable() {
        return live.current.draggable;
      },
      get alignCenter() {
        return live.current.alignCenter;
      },
      setPosition,
    }),
  );
  const previousFullscreen = useRef(fullscreen);
  useLayoutEffect(() => {
    if (previousFullscreen.current !== fullscreen) {
      setPosition(undefined);
      drag.up();
    }
    previousFullscreen.current = fullscreen;
  }, [fullscreen, drag]);
  useLayoutEffect(() => {
    if (!draggable || !visible) drag.up();
  }, [draggable, visible, drag]);
  useLayoutEffect(() => () => drag.up(), [drag]);
  const id = useId();
  if (!container || !portalContainer || (unmountOnClose && !visible && !mounted)) return null;
  const closeButton = !simple && closable;
  const hasTitle = !hideTitle && !!title;
  const cancel = controller.confirmation.cancel;
  const content = (
    <div
      {...attrs}
      className={[`${prefix}-container`, className].filter(Boolean).join(' ')}
      sd-theme={theme.mode}
      style={{
        ...theme.variables,
        zIndex,
        ...style,
        display: visible || mounted ? undefined : 'none',
      }}
    >
      {mask && (
        <div
          ref={maskRef}
          className={`${prefix}-mask`}
          style={maskStyle}
          onMouseDown={(event) => maskControl.down(event.nativeEvent)}
          onClick={(event) => maskControl.click(event.nativeEvent)}
        />
      )}
      <div
        ref={wrapper}
        className={[
          `${prefix}-wrapper`,
          alignCenter && !fullscreen && `${prefix}-wrapper-align-center`,
          position && `${prefix}-wrapper-moved`,
        ]
          .filter(Boolean)
          .join(' ')}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) maskControl.down(event.nativeEvent);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) maskControl.click(event.nativeEvent);
        }}
      >
        <div
          ref={dialogRef}
          className={[
            prefix,
            ...(Array.isArray(modalClass) ? modalClass : [modalClass]),
            simple && `${prefix}-simple`,
            draggable && !fullscreen && `${prefix}-draggable`,
            fullscreen && `${prefix}-fullscreen`,
          ]
            .filter(Boolean)
            .join(' ')}
          style={applyModalLayout(
            { ...modalStyle },
            { width, fullscreen, alignCenter, top, position },
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={hasTitle ? `${id}-title` : undefined}
          aria-describedby={`${id}-body`}
          tabIndex={-1}
        >
          {!hideTitle && (!!title || closable) && (
            <div
              className={[`${prefix}-header`, closeButton && `${prefix}-header-with-close`]
                .filter(Boolean)
                .join(' ')}
              onPointerDown={(event) => drag.down(event.nativeEvent, event.currentTarget)}
            >
              {!!title && (
                <div
                  id={`${id}-title`}
                  className={[
                    `${prefix}-title`,
                    `${prefix}-title-align-${titleAlign}`,
                    closeButton && `${prefix}-title-with-close`,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {messageType && (
                    <div className={`${prefix}-title-icon`}>
                      <StatusIcon type={messageType} />
                    </div>
                  )}
                  <Ellipsis className={`${prefix}-title-text`} tooltip={titleEllipsisTooltip}>
                    {title}
                  </Ellipsis>
                </div>
              )}
              {closeButton && (
                <div
                  data-modal-close
                  tabIndex={0}
                  role="button"
                  aria-label={t('a11y.close')}
                  className={`${prefix}-close-btn`}
                  onClick={(event) => cancel(event.nativeEvent)}
                  onKeyDown={(event) => onActivate(cancel)(event.nativeEvent)}
                >
                  <span className={`${icon}-hover`}>
                    <svg
                      className={`${icon} ${icon}-close`}
                      viewBox="0 0 48 48"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      aria-hidden="true"
                    >
                      <path d="m12 12 24 24M12 36l24-24" />
                    </svg>
                  </span>
                </div>
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
                      onClick={(event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
                        (
                          cancelButtonProps?.onClick as
                            | ((event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void)
                            | undefined
                        )?.(event);
                        cancel(event.nativeEvent);
                      }}
                    >
                      {cancelText || t('modal.cancelText')}
                    </Button>
                  )}
                  <Button
                    type="primary"
                    {...okButtonProps}
                    loading={okLoading || loading}
                    onClick={(event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
                      (
                        okButtonProps?.onClick as
                          | ((event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void)
                          | undefined
                      )?.(event);
                      void controller.confirmation.ok(event.nativeEvent);
                    }}
                  >
                    {okText || t('modal.okText')}
                  </Button>
                </>
              ) : (
                footer
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  return renderToBody ? createPortal(content, portalContainer) : content;
}
