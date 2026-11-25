import type { MotionStyle } from 'framer-motion';
import type { PointerEvent } from 'react';

import {
  createBloomMenuFoundation,
  getBloomMenuInitialState,
} from '@sdata/web-core/bloom-menu/foundation';
import { motion } from 'framer-motion';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { BloomMenuItem, BloomMenuProps } from './types.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useBeamPreferences } from '../_shared/use-beam-preferences.js';
import { Button } from '../button/index.js';
import { usePrefix } from '../config-provider/index.js';
import IconClose from '../icon/icon-close.js';
import IconPlus from '../icon/icon-plus.js';
import { useI18n } from '../locale/index.js';
import { Trigger } from '../trigger/index.js';
export type { BloomMenuItem, BloomMenuOffset, BloomMenuProps } from './types.js';
export type BloomMenuInstance = HTMLDivElement;
export function BloomMenu({
  items,
  modelValue,
  defaultOpen = false,
  columns = 3,
  title = 'Create',
  triggerText = 'Create',
  buttonProps,
  offset,
  closeAriaLabel,
  onModelValueChange,
  onOpen,
  onClose,
  onSelect,
  renderTrigger,
  renderHeader,
  renderIcon,
  renderItem,
  empty,
  className,
  ...attrs
}: BloomMenuProps) {
  const prefix = usePrefix('bloom-menu');
  const { t } = useI18n();
  const button = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const preferences = useBeamPreferences();
  const afterRender = useAfterRender();
  const live = useRef({
    items,
    modelValue,
    columns,
    offset,
    prefix,
    renderTrigger,
    onModelValueChange,
    onOpen,
    onClose,
    onSelect,
  });
  live.current = {
    items,
    modelValue,
    columns,
    offset,
    prefix,
    renderTrigger,
    onModelValueChange,
    onOpen,
    onClose,
    onSelect,
  };
  const data = useRef(getBloomMenuInitialState(modelValue, defaultOpen));
  const connection = useRef(0);
  const frames = useRef(new Set<number>());
  const [, render] = useState(0);
  const [foundation] = useState(() => {
    const update = <K extends keyof typeof data.current>(
      key: K,
      value: (typeof data.current)[K],
    ) => {
      if (data.current[key] !== value) {
        data.current[key] = value;
        render((v) => v + 1);
      }
    };
    const current: ReturnType<typeof createBloomMenuFoundation<BloomMenuItem>> =
      createBloomMenuFoundation(
        {
          get props() {
            return live.current;
          },
          get prefixCls() {
            return live.current.prefix;
          },
          get buttonElement() {
            return button.current ?? undefined;
          },
          get panelElement() {
            return panel.current ?? undefined;
          },
          get hasCustomTrigger() {
            return !!live.current.renderTrigger;
          },
          get reducedMotion() {
            return preferences.reducedMotion;
          },
          get internalOpen() {
            return data.current.internalOpen;
          },
          set internalOpen(value) {
            update('internalOpen', value);
          },
          get popupVisible() {
            return data.current.popupVisible;
          },
          set popupVisible(value) {
            update('popupVisible', value);
          },
          get triggerStyle() {
            return data.current.triggerStyle;
          },
          set triggerStyle(value) {
            update('triggerStyle', value);
          },
        },
        {
          afterRender(task) {
            const ticket = connection.current;
            void afterRender().then(() => {
              if (connection.current === ticket) task();
            });
          },
          requestFrame(task) {
            const ticket = connection.current;
            const frame = requestAnimationFrame(() => {
              frames.current.delete(frame);
              if (connection.current === ticket) task();
            });
            frames.current.add(frame);
          },
          update: (value) => live.current.onModelValueChange?.(value),
          opened: () => live.current.onOpen?.(),
          closed: () => live.current.onClose?.(),
          select: (item, index) => live.current.onSelect?.(item, index),
        },
      );
    return current;
  });
  const isOpen = foundation.getIsOpen();
  useLayoutEffect(() => {
    connection.current++;
    foundation.captureTriggerStyle();
    return () => {
      connection.current++;
      foundation.dispose();
      frames.current.forEach(cancelAnimationFrame);
      frames.current.clear();
    };
  }, [foundation]);
  useLayoutEffect(() => foundation.syncOpen(isOpen), [foundation, isOpen]);
  const floatingOptions = useMemo(
    () => foundation.getFloatingOptions(),
    [foundation, offset?.left, offset?.top],
  );
  const source = data.current.triggerStyle;
  const panelStyle: MotionStyle & Record<`--${string}`, string | number> = {
    '--bloom-menu-columns': foundation.getNormalizedColumns(),
    '--bloom-menu-source-width': `${source.width}px`,
    '--bloom-menu-source-height': `${source.height}px`,
    '--bloom-menu-source-background': source.backgroundColor,
    '--bloom-menu-source-border-color': source.borderColor,
    '--bloom-menu-source-border-radius': source.borderRadius,
    '--bloom-menu-source-box-shadow': source.boxShadow,
    '--bloom-menu-source-color': source.color,
  };
  return (
    <div
      {...attrs}
      className={[prefix, isOpen && `${prefix}-open`, className].filter(Boolean).join(' ')}
    >
      <Trigger
        popupVisible={data.current.popupVisible}
        trigger="click"
        floatingOptions={floatingOptions}
        contentClass={`${prefix}-popup`}
        contentStyle={{ pointerEvents: isOpen ? undefined : 'none' }}
        duration={0}
        animationName=""
        renderToBody
        escToClose
        ariaHasPopup="dialog"
        onPopupVisibleChange={foundation.handlePopupVisibleChange}
        content={
          <motion.div
            data-bloom-menu-panel=""
            initial={foundation.getPanelInitial()}
            animate={foundation.getPanelTarget()}
            transition={foundation.getMorphTransition()}
            style={panelStyle}
            className={`${prefix}-panel`}
            role="dialog"
            aria-label={title}
          >
            <div ref={panel}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={foundation.getContentTransition()}
                className={`${prefix}-content`}
              >
                <div className={`${prefix}-header`}>
                  {renderHeader ? (
                    renderHeader({ close: foundation.closeHeaderSlot })
                  ) : (
                    <>
                      <span className={`${prefix}-title`}>{title}</span>
                      <Button
                        type="text"
                        shape="circle"
                        size="mini"
                        className={`${prefix}-close`}
                        aria-label={closeAriaLabel ?? t('a11y.bloomMenuClose')}
                        onClick={() => foundation.close(true)}
                        icon={<IconClose aria-hidden="true" />}
                      />
                    </>
                  )}
                </div>
                {items.length ? (
                  <motion.div
                    initial={foundation.getGridInitial()}
                    animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                    transition={foundation.getGridTransition()}
                    className={`${prefix}-grid`}
                  >
                    {items.map((item, index) => {
                      const layout = foundation.getItemLayout(item, index);
                      return (
                        <Button
                          key={item.value}
                          type="text"
                          long
                          disabled={item.disabled}
                          className={[
                            `${prefix}-item`,
                            layout.borderRight && `${prefix}-item-border-right`,
                            layout.borderBottom && `${prefix}-item-border-bottom`,
                            layout.disabled && `${prefix}-item-disabled`,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => foundation.selectItem(item, index)}
                        >
                          <motion.div
                            initial={foundation.getItemInitial()}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            transition={foundation.getItemTransition(index)}
                            className={`${prefix}-item-content`}
                          >
                            {renderItem ? (
                              renderItem({ item, index })
                            ) : (
                              <>
                                {(item.icon || renderIcon) && (
                                  <span className={`${prefix}-item-icon`}>
                                    {renderIcon ? renderIcon({ item, index }) : item.icon}
                                  </span>
                                )}
                                <span className={`${prefix}-item-label`}>{item.label}</span>
                              </>
                            )}
                          </motion.div>
                        </Button>
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className={`${prefix}-empty`}>{empty ?? t('a11y.bloomMenuEmpty')}</div>
                )}
              </motion.div>
            </div>
          </motion.div>
        }
      >
        <Button
          {...buttonProps}
          ref={(element: HTMLButtonElement | HTMLAnchorElement | null) => {
            button.current = element;
          }}
          data-bloom-menu-trigger=""
          className={[buttonProps?.className, `${prefix}-trigger`].filter(Boolean).join(' ')}
          onPointerDown={(event: PointerEvent<HTMLButtonElement | HTMLAnchorElement>) => {
            if (buttonProps?.href !== undefined)
              buttonProps.onPointerDown?.(event as PointerEvent<HTMLAnchorElement>);
            else buttonProps?.onPointerDown?.(event as PointerEvent<HTMLButtonElement>);
            foundation.captureTriggerStyle(event);
          }}
        >
          <span className={`${prefix}-trigger-content`}>
            {renderTrigger ? (
              renderTrigger({ open: foundation.open })
            ) : (
              <>
                {triggerText}
                <IconPlus aria-hidden="true" />
              </>
            )}
          </span>
        </Button>
      </Trigger>
    </div>
  );
}
export default BloomMenu;
