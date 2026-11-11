import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, MouseEvent as ReactMouseEvent, ReactNode } from 'react';

import {
  createDropdownFoundation,
  createDropdownOptionFoundation,
  type DropdownOptionContext,
  type DropdownValue,
} from '@sdata/web-core/dropdown/foundation';
import { createDropdownPanelFoundation } from '@sdata/web-core/dropdown/panel';
import {
  createContext,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { usePopupVisible } from '../_shared/use-popup-visible.js';
import { Button, ButtonGroup, type ButtonProps } from '../button/index.js';
import { usePrefix } from '../config-provider/index.js';
import { Empty } from '../empty/index.js';
import { Scrollbar } from '../scrollbar/index.js';
import { Trigger, type TriggerProps } from '../trigger/index.js';

export type { DropdownValue };
export type DropdownPosition = 'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br';
export interface DropdownProps extends Omit<TriggerProps, 'position' | 'onSelect' | 'onScroll'> {
  position?: DropdownPosition;
  popupMaxHeight?: boolean | number;
  hideOnSelect?: boolean;
  isEmpty?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  onSelect?: (value: DropdownValue, event: Event) => void;
  onScroll?: (event: Event) => void;
  onReachBottom?: (event: Event) => void;
}
export type DropDownProps = DropdownProps;
const DropdownContext = createContext<
  (DropdownOptionContext & { popupMaxHeight?: number | boolean }) | undefined
>(undefined);

interface PanelProps {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  isEmpty?: boolean;
  trigger: string | string[];
  className?: string;
  onScroll?: (event: Event) => void;
  onReachBottom?: (event: Event) => void;
}
function DropdownPanel(props: PanelProps) {
  const prefix = usePrefix('dropdown');
  const context = useContext(DropdownContext);
  const list = useRef<HTMLUListElement>(null);
  const live = useRef({ props, context });
  live.current = { props, context };
  const [foundation] = useState(() =>
    createDropdownPanelFoundation(
      {
        get list() {
          return list.current ?? undefined;
        },
        bottomOffset: 0,
        get trigger() {
          return live.current.props.trigger;
        },
        get isHoverTrigger(): boolean {
          return foundation.getIsHoverTrigger();
        },
        get popupMaxHeight() {
          return live.current.context?.popupMaxHeight;
        },
      },
      {
        get activeElement() {
          return document.activeElement;
        },
        isElement: (value): value is HTMLElement => value instanceof HTMLElement,
        requestFrame: (callback) => requestAnimationFrame(callback),
        cancelFrame: (frame) => cancelAnimationFrame(frame),
      },
      (event) => live.current.props.onScroll?.(event),
      (event) => live.current.props.onReachBottom?.(event),
    ),
  );
  useLayoutEffect(() => {
    foundation.focusOnMount((callback) => callback());
    return foundation.destroy;
  }, [foundation]);
  return (
    <div
      className={[
        prefix,
        props.header != null && `${prefix}-has-header`,
        props.footer != null && `${prefix}-has-footer`,
        props.className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {props.header != null && <div className={`${prefix}-header`}>{props.header}</div>}
      {props.isEmpty && (
        <div className={`${prefix}-empty`}>
          <Empty />
        </div>
      )}
      <Scrollbar
        className={`${prefix}-list-wrapper`}
        style={foundation.getStyle()}
        disableHorizontal
        onScroll={foundation.handleScroll}
      >
        <ul
          ref={list}
          role="menu"
          tabIndex={-1}
          className={`${prefix}-list`}
          onKeyDown={(event) => foundation.handleKeydown(event.nativeEvent)}
        >
          {props.children}
        </ul>
      </Scrollbar>
      {props.footer != null && !props.isEmpty && (
        <div className={`${prefix}-footer`}>{props.footer}</div>
      )}
    </div>
  );
}

function DropdownRoot({
  children,
  content,
  header,
  footer,
  isEmpty = false,
  popupMaxHeight = true,
  hideOnSelect = true,
  onSelect,
  onScroll,
  onReachBottom,
  trigger = 'click',
  position = 'bottom',
  popupVisible,
  defaultPopupVisible = false,
  onPopupVisibleChange,
  ...attrs
}: DropdownProps) {
  const prefix = usePrefix('dropdown');
  const visibility = usePopupVisible(popupVisible, defaultPopupVisible, onPopupVisibleChange);
  const live = useRef({ hideOnSelect, onSelect });
  live.current = { hideOnSelect, onSelect };
  const [foundation] = useState(() =>
    createDropdownFoundation(
      {
        get hideOnSelect() {
          return live.current.hideOnSelect;
        },
      },
      (value, event) => live.current.onSelect?.(value, event),
      visibility.handlePopupVisibleChange,
    ),
  );
  return (
    <DropdownContext.Provider
      value={{ popupMaxHeight, onOptionClick: foundation.handleOptionClick }}
    >
      <Trigger
        animationName="slide-dynamic-origin"
        autoFitTransformOrigin
        popupOffset={4}
        openedClass={`${prefix}-open`}
        escToClose
        ariaHasPopup="menu"
        {...attrs}
        trigger={trigger}
        position={position}
        popupVisible={visibility.getVisible()}
        onPopupVisibleChange={visibility.handlePopupVisibleChange}
        content={
          <DropdownPanel
            trigger={trigger}
            header={header}
            footer={footer}
            isEmpty={isEmpty}
            onScroll={onScroll}
            onReachBottom={onReachBottom}
          >
            {content}
          </DropdownPanel>
        }
      >
        {children}
      </Trigger>
    </DropdownContext.Provider>
  );
}

export interface DoptionProps extends Omit<ComponentPropsWithRef<'li'>, 'value' | 'onClick'> {
  value?: DropdownValue;
  disabled?: boolean;
  active?: boolean;
  uninjectContext?: boolean;
  icon?: ReactNode;
  suffix?: ReactNode;
  onClick?: (event: ReactMouseEvent<HTMLLIElement>) => void;
}
export function Doption({
  value,
  disabled = false,
  active = false,
  uninjectContext = false,
  icon,
  suffix,
  children,
  onClick,
  className,
  ref,
  ...attrs
}: DoptionProps) {
  const prefix = usePrefix('dropdown-option');
  const parent = useContext(DropdownContext);
  const element = useRef<HTMLLIElement>(null);
  useImperativeHandle(ref, () => element.current!, []);
  return (
    <li
      {...attrs}
      ref={element}
      role="menuitem"
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? undefined : -1}
      className={[
        prefix,
        disabled && `${prefix}-disabled`,
        active && `${prefix}-active`,
        suffix != null && `${prefix}-has-suffix`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(event) =>
        createDropdownOptionFoundation(
          { disabled, value, context: uninjectContext ? undefined : parent },
          () => element.current?.textContent,
          () => onClick?.(event),
        ).handleClick(event.nativeEvent)
      }
    >
      {icon != null && <span className={`${prefix}-icon`}>{icon}</span>}
      <span className={`${prefix}-content`}>{children}</span>
      {suffix != null && <span className={`${prefix}-suffix`}>{suffix}</span>}
    </li>
  );
}
export interface DgroupProps extends Omit<ComponentPropsWithRef<'li'>, 'title'> {
  title?: ReactNode;
}
export function Dgroup({ title, children, className, ...attrs }: DgroupProps) {
  const prefix = usePrefix('dropdown-group');
  return (
    <>
      <li {...attrs} className={[`${prefix}-title`, className].filter(Boolean).join(' ')}>
        {title}
      </li>
      {children}
    </>
  );
}
export interface DsubmenuProps extends Omit<TriggerProps, 'children' | 'position' | 'trigger'> {
  children?: ReactNode;
  value?: string | number;
  position?: 'rt' | 'lt';
  trigger?: 'hover' | 'click' | ('hover' | 'click')[];
  optionProps?: DoptionProps;
  icon?: ReactNode;
  suffix?: ReactNode;
  footer?: ReactNode;
}
export function Dsubmenu({
  children,
  content,
  value: _value,
  icon,
  suffix,
  footer,
  optionProps,
  disabled = false,
  trigger = 'click',
  position = 'rt',
  popupVisible,
  defaultPopupVisible = false,
  onPopupVisibleChange,
  ...attrs
}: DsubmenuProps) {
  const prefix = usePrefix('dropdown');
  const visibility = usePopupVisible(popupVisible, defaultPopupVisible, onPopupVisibleChange);
  return (
    <Trigger
      popupOffset={4}
      {...attrs}
      trigger={trigger}
      position={position}
      disabled={disabled}
      popupVisible={visibility.getVisible()}
      onPopupVisibleChange={visibility.handlePopupVisibleChange}
      content={
        <DropdownPanel trigger={trigger} className={`${prefix}-submenu`} footer={footer}>
          {content}
        </DropdownPanel>
      }
    >
      <Doption
        {...optionProps}
        disabled={disabled || optionProps?.disabled}
        active={visibility.getVisible()}
        uninjectContext
        icon={icon}
        suffix={
          suffix === undefined ? (
            <svg
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              width="1em"
              height="1em"
              aria-hidden="true"
            >
              <path d="m18 10 14 14-14 14" />
            </svg>
          ) : (
            suffix
          )
        }
      >
        {children}
      </Doption>
    </Trigger>
  );
}
export interface DropdownButtonProps
  extends
    Omit<ComponentPropsWithRef<'div'>, 'onClick' | 'onSelect' | 'content'>,
    Pick<
      DropdownProps,
      | 'popupVisible'
      | 'defaultPopupVisible'
      | 'onPopupVisibleChange'
      | 'trigger'
      | 'position'
      | 'popupContainer'
      | 'floatingOptions'
      | 'hideOnSelect'
      | 'onSelect'
    > {
  children?: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
  type?: ButtonProps['type'];
  size?: ButtonProps['size'];
  buttonProps?: ButtonProps;
  icon?: ReactNode | ((context: { popupVisible: boolean }) => ReactNode);
  onClick?: (event: ReactMouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
}
export function DropdownButton({
  children,
  type,
  size,
  buttonProps,
  icon,
  disabled = false,
  popupVisible,
  defaultPopupVisible = false,
  onPopupVisibleChange,
  onClick,
  position = 'br',
  content,
  trigger,
  popupContainer,
  floatingOptions,
  hideOnSelect,
  onSelect,
  ...attrs
}: DropdownButtonProps) {
  const visibility = usePopupVisible(popupVisible, defaultPopupVisible, onPopupVisibleChange);
  return (
    <ButtonGroup {...attrs}>
      <Button
        size={size}
        type={type}
        {...buttonProps}
        disabled={disabled || buttonProps?.disabled}
        onClick={(event: ReactMouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
          if (buttonProps?.href !== undefined)
            buttonProps.onClick?.(event as ReactMouseEvent<HTMLAnchorElement>);
          else buttonProps?.onClick?.(event as ReactMouseEvent<HTMLButtonElement>);
          onClick?.(event);
        }}
      >
        {children}
      </Button>
      <DropdownRoot
        content={content}
        trigger={trigger}
        popupContainer={popupContainer}
        floatingOptions={floatingOptions}
        hideOnSelect={hideOnSelect}
        onSelect={onSelect}
        disabled={disabled}
        position={position}
        popupVisible={visibility.getVisible()}
        onPopupVisibleChange={visibility.handlePopupVisibleChange}
      >
        <Button
          size={size}
          type={type}
          disabled={disabled}
          icon={
            typeof icon === 'function'
              ? icon({ popupVisible: visibility.getVisible() })
              : (icon ?? (
                  <svg
                    viewBox="0 0 48 48"
                    fill="currentColor"
                    width="1em"
                    height="1em"
                    aria-label="…"
                  >
                    <circle cx="10" cy="24" r="3" />
                    <circle cx="24" cy="24" r="3" />
                    <circle cx="38" cy="24" r="3" />
                  </svg>
                ))
          }
        />
      </DropdownRoot>
    </ButtonGroup>
  );
}
export const Dropdown = Object.assign(DropdownRoot, {
  Option: Doption,
  Group: Dgroup,
  Submenu: Dsubmenu,
  Button: DropdownButton,
});
export default Dropdown;

export type DropdownButtonInstance = ReactComponentRef<typeof DropdownButton>;
export type DropdownGroupInstance = ReactComponentRef<typeof Dgroup>;
export type DropdownOptionInstance = ReactComponentRef<typeof Doption>;
