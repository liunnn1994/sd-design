import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import {
  createCollapseFoundation,
  createCollapseItemFoundation,
  normalizeCollapseKey,
  type CollapseKey,
} from '@sdata/web-core/collapse/foundation';
import { runCssTransition } from '@sdata/web-core/transition/css';
import {
  Children,
  Fragment,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { usePrefix } from '../config-provider/index.js';

export type { CollapseKey };
export interface CollapseIconContext {
  active: boolean;
  disabled: boolean;
  position: 'left' | 'right';
}
type ExpandIcon = ReactNode | ((context: CollapseIconContext) => ReactNode);
export interface CollapseProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange'> {
  activeKey?: CollapseKey[];
  defaultActiveKey?: CollapseKey[];
  accordion?: boolean;
  showExpandIcon?: boolean;
  expandIconPosition?: 'left' | 'right';
  bordered?: boolean;
  destroyOnHide?: boolean;
  expandIcon?: ExpandIcon;
  onActiveKeyChange?: (keys: CollapseKey[]) => void;
  onChange?: (keys: CollapseKey[], event: Event) => void;
}
export interface CollapseItemProps extends ComponentPropsWithRef<'div'> {
  itemKey?: CollapseKey;
  header?: ReactNode;
  extra?: ReactNode;
  disabled?: boolean;
  showExpandIcon?: boolean;
  destroyOnHide?: boolean;
  expandIcon?: ExpandIcon;
}
const CollapseContext = createContext<
  | {
      keys: CollapseKey[];
      showExpandIcon?: boolean;
      expandIconPosition: 'left' | 'right';
      destroyOnHide: boolean;
      expandIcon?: ExpandIcon;
      click(key: CollapseKey, event: Event): void;
    }
  | undefined
>(undefined);
const ItemKeyContext = createContext<string | null>(null);
function provideItemKeys(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return child;
    if (child.type === Fragment)
      return cloneElement(child, {}, provideItemKeys(child.props.children));
    return <ItemKeyContext.Provider value={child.key}>{child}</ItemKeyContext.Provider>;
  });
}
function CollapseRoot({
  activeKey,
  defaultActiveKey = [],
  accordion = false,
  showExpandIcon,
  expandIconPosition = 'left',
  bordered = true,
  destroyOnHide = false,
  expandIcon,
  onActiveKeyChange,
  onChange,
  children,
  className,
  ...attrs
}: CollapseProps) {
  const prefix = usePrefix('collapse');
  const [inner, setInner] = useState(defaultActiveKey);
  const live = useRef({ activeKey, inner, accordion, onActiveKeyChange, onChange });
  live.current = { activeKey, inner, accordion, onActiveKeyChange, onChange };
  const [foundation] = useState(() =>
    createCollapseFoundation({
      get value() {
        return live.current.activeKey;
      },
      get inner() {
        return live.current.inner;
      },
      get keys(): CollapseKey[] {
        return foundation.getKeys();
      },
      get accordion() {
        return live.current.accordion;
      },
      setInner(value) {
        live.current.inner = value;
        setInner(value);
      },
      onChange(value, event) {
        live.current.onActiveKeyChange?.(value);
        live.current.onChange?.(value, event);
      },
    }),
  );
  return (
    <CollapseContext.Provider
      value={{
        keys: foundation.getKeys(),
        showExpandIcon,
        expandIconPosition,
        destroyOnHide,
        expandIcon,
        click: foundation.click,
      }}
    >
      <div
        {...attrs}
        className={[prefix, !bordered && `${prefix}-borderless`, className]
          .filter(Boolean)
          .join(' ')}
      >
        {provideItemKeys(children)}
      </div>
    </CollapseContext.Provider>
  );
}
export function CollapseItem({
  itemKey,
  header,
  extra,
  disabled = false,
  showExpandIcon = true,
  destroyOnHide = false,
  expandIcon,
  children,
  className,
  ...attrs
}: CollapseItemProps) {
  const prefix = usePrefix('collapse-item');
  const hoverPrefix = usePrefix('icon-hover');
  const context = useContext(CollapseContext);
  const inheritedKey = useContext(ItemKeyContext);
  const key = normalizeCollapseKey(itemKey ?? inheritedKey);
  const active = context?.keys.includes(key) ?? false;
  const destroy = Boolean(context?.destroyOnHide || destroyOnHide);
  const showIcon = context?.showExpandIcon ?? showExpandIcon;
  const position = context?.expandIconPosition ?? 'left';
  const [mounted, setMounted] = useState(destroy ? active : true);
  const [present, setPresent] = useState(active);
  const content = useRef<HTMLDivElement>(null);
  const previous = useRef(active);
  const id = useId();
  const headerId = `${prefix}-${id}-header`;
  const contentId = `${prefix}-${id}-content`;
  const live = useRef({ active, destroy, disabled, mounted, context, key });
  live.current = { active, destroy, disabled, mounted, context, key };
  const [foundation] = useState(() =>
    createCollapseItemFoundation({
      get active() {
        return live.current.active;
      },
      get destroy() {
        return live.current.destroy;
      },
      get disabled() {
        return live.current.disabled;
      },
      get mounted() {
        return live.current.mounted;
      },
      setMounted(value) {
        live.current.mounted = value;
        setMounted(value);
      },
      onClick: (event) => live.current.context?.click(live.current.key, event),
      isInteractiveTarget: (event) =>
        Boolean(
          (event.target as HTMLElement | null)?.closest(
            'input, textarea, select, button, a[href], [contenteditable="true"]',
          ),
        ),
    }),
  );
  useLayoutEffect(() => {
    foundation.syncActive(active);
    if (previous.current === active || !content.current) return;
    previous.current = active;
    if (active) {
      foundation.leaveCancelled();
      setPresent(true);
    } else foundation.beforeLeave();
    const cancel = runCssTransition(content.current, {
      name: 'collapse-slider',
      enter: active,
      finish() {
        if (!live.current.active) {
          setPresent(false);
          foundation.afterLeave();
        }
      },
    });
    return () => {
      cancel();
      foundation.leaveCancelled();
    };
  }, [active, foundation]);
  useLayoutEffect(() => foundation.syncDestroy(destroy), [destroy, foundation]);
  const icon = expandIcon !== undefined ? expandIcon : context?.expandIcon;
  const iconContent = typeof icon === 'function' ? icon({ active, disabled, position }) : icon;
  return (
    <div
      {...attrs}
      className={[prefix, active && `${prefix}-active`, !showIcon && `${prefix}-no-icon`, className]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        role="button"
        aria-disabled={disabled}
        aria-expanded={active}
        aria-controls={contentId}
        tabIndex={disabled ? -1 : 0}
        className={[
          `${prefix}-header`,
          `${prefix}-header-${position}`,
          disabled && `${prefix}-header-disabled`,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={(event) => foundation.click(event.nativeEvent)}
        onKeyDown={(event) => foundation.keydown(event.nativeEvent)}
      >
        {showIcon && (
          <span
            className={[
              hoverPrefix,
              `${prefix}-icon-hover`,
              disabled && `${hoverPrefix}-disabled`,
              position === 'right' && `${prefix}-icon-right`,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {icon !== undefined ? (
              iconContent
            ) : (
              <svg
                className={`${prefix}-expand-icon`}
                viewBox="0 0 48 48"
                width="1em"
                height="1em"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d={
                    position === 'right'
                      ? 'M13.171 24.937a1.2 1.2 0 0 1 0-1.874L30.051 9.56c.785-.629 1.949-.07 1.949.937v27.006c0 1.006-1.164 1.566-1.95.937z'
                      : 'M34.829 23.063a1.2 1.2 0 0 1 0 1.874L17.949 38.44C17.164 39.069 16 38.51 16 37.503V10.497c0-1.006 1.164-1.566 1.95-.937z'
                  }
                />
              </svg>
            )}
          </span>
        )}
        <div id={headerId} className={`${prefix}-header-title`}>
          {header}
        </div>
        {extra !== undefined && <div className={`${prefix}-header-extra`}>{extra}</div>}
      </div>
      <div
        ref={content}
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        className={[`${prefix}-content`, active && `${prefix}-content-expend`]
          .filter(Boolean)
          .join(' ')}
        style={{ display: active || present ? undefined : 'none' }}
      >
        {mounted && (
          <div className={`${prefix}-content-box`}>
            <div className={`${prefix}-content-body`}>{children}</div>
          </div>
        )}
      </div>
    </div>
  );
}
export const Collapse = Object.assign(CollapseRoot, { Item: CollapseItem });
export default Collapse;

export type CollapseInstance = ReactComponentRef<typeof Collapse>;
export type CollapseItemInstance = ReactComponentRef<typeof CollapseItem>;
