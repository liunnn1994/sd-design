import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import {
  createBreadcrumbItemFoundation,
  getBreadcrumbNeedHide,
  getBreadcrumbRouteEntries,
  type BreadcrumbRoute,
} from '@sdata/web-core/breadcrumb/foundation';
import { createContext, useContext, useLayoutEffect, useState } from 'react';

import { getRenderItems } from '../_shared/children.js';
import { usePrefix } from '../config-provider/index.js';
import { Dropdown, Doption, type DropdownProps } from '../dropdown/index.js';
import { useI18n } from '../locale/index.js';

export type { BreadcrumbRoute };
export interface BreadcrumbProps extends ComponentPropsWithRef<'div'> {
  maxCount?: number;
  routes?: BreadcrumbRoute[];
  separator?: ReactNode;
  customUrl?: (paths: string[]) => string;
  itemRender?: (context: {
    route: BreadcrumbRoute;
    routes: BreadcrumbRoute[];
    paths: string[];
  }) => ReactNode;
  moreIcon?: ReactNode;
}
export interface BreadcrumbItemProps extends ComponentPropsWithRef<'div'> {
  separator?: ReactNode;
  droplist?: BreadcrumbRoute['children'];
  dropdownContent?: ReactNode;
  dropdownProps?: Omit<DropdownProps, 'children' | 'content'>;
  index?: number;
}
const BreadcrumbContext = createContext<
  | {
      total: number;
      maxCount: number;
      needHide: boolean;
      index: number;
      separator?: ReactNode;
      moreIcon?: ReactNode;
    }
  | undefined
>(undefined);

function BreadcrumbIcon({ name }: { name: 'more' | 'down' | 'oblique-line' }) {
  const prefix = usePrefix('icon');
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      width="1em"
      height="1em"
      aria-hidden="true"
      className={`${prefix} ${prefix}-${name}`}
    >
      {name === 'more' ? (
        <path fill="currentColor" d="M38 25v-2h2v2zM23 25v-2h2v2zM8 25v-2h2v2z" />
      ) : (
        <path
          d={
            name === 'down' ? 'M39.6 17.443 24.043 33 8.487 17.443' : 'M29.506 6.502 18.493 41.498'
          }
        />
      )}
    </svg>
  );
}
function BreadcrumbRoot({
  maxCount = 0,
  routes = [],
  separator,
  customUrl,
  itemRender,
  moreIcon,
  children,
  className,
  ...attrs
}: BreadcrumbProps) {
  const prefix = usePrefix('breadcrumb');
  const { t } = useI18n();
  const items =
    children !== undefined
      ? getRenderItems(children)
      : getBreadcrumbRouteEntries({ routes, customUrl }).map((entry) => ({
          key: entry.route.path || entry.route.label,
          content: (
            <BreadcrumbItem droplist={entry.route.children}>
              {itemRender ? (
                itemRender({ route: entry.route, routes, paths: entry.paths })
              ) : entry.last ? (
                <span>{entry.route.label}</span>
              ) : (
                <a href={entry.href}>{entry.route.label}</a>
              )}
            </BreadcrumbItem>
          ),
        }));
  const context = {
    total: items.length,
    maxCount,
    needHide: getBreadcrumbNeedHide({ total: items.length, maxCount }),
    separator,
    moreIcon,
  };
  return (
    <div
      role="list"
      aria-label={t('a11y.breadcrumb')}
      {...attrs}
      className={[prefix, className].filter(Boolean).join(' ')}
    >
      {items.map((item, index) => (
        <BreadcrumbContext.Provider key={item.key} value={{ ...context, index }}>
          {item.content}
        </BreadcrumbContext.Provider>
      ))}
    </div>
  );
}
export function BreadcrumbItem({
  separator,
  droplist,
  dropdownContent,
  dropdownProps,
  index,
  children,
  className,
  ...attrs
}: BreadcrumbItemProps) {
  const prefix = usePrefix('breadcrumb-item');
  const { t } = useI18n();
  const context = useContext(BreadcrumbContext);
  const foundation = createBreadcrumbItemFoundation(
    { index: context?.index ?? index ?? 0 },
    context,
  );
  const [visible, setVisible] = useState(false);
  const hasDroplist = droplist !== undefined || dropdownContent !== undefined;
  useLayoutEffect(() => {
    if (!hasDroplist) setVisible(false);
  }, [hasDroplist]);
  if (!foundation.getShow()) return null;
  const more = foundation.getDisplayMore();
  const item = (
    <div
      role="listitem"
      aria-label={more ? t('a11y.breadcrumbEllipsis') : undefined}
      {...attrs}
      className={[prefix, hasDroplist && `${prefix}-with-dropdown`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {more ? (context?.moreIcon ?? <BreadcrumbIcon name="more" />) : children}
      {hasDroplist && (
        <span
          aria-hidden="true"
          className={[`${prefix}-dropdown-icon`, visible && `${prefix}-dropdown-icon-active`]
            .filter(Boolean)
            .join(' ')}
        >
          <BreadcrumbIcon name="down" />
        </span>
      )}
    </div>
  );
  return (
    <>
      {hasDroplist ? (
        <Dropdown
          popupVisible={visible}
          {...dropdownProps}
          onPopupVisibleChange={(value) => {
            setVisible(value);
            dropdownProps?.onPopupVisibleChange?.(value);
          }}
          content={
            dropdownContent !== undefined
              ? dropdownContent
              : droplist?.map((entry, itemIndex) => (
                  <Doption key={`${itemIndex}-${entry.path}`} value={entry.path}>
                    {entry.label}
                  </Doption>
                ))
          }
        >
          {item}
        </Dropdown>
      ) : (
        item
      )}
      {foundation.getShowSeparator() && (
        <div aria-hidden="true" className={`${prefix}-separator`}>
          {separator ?? context?.separator ?? <BreadcrumbIcon name="oblique-line" />}
        </div>
      )}
    </>
  );
}
export const Breadcrumb = Object.assign(BreadcrumbRoot, { Item: BreadcrumbItem });
export default Breadcrumb;

export type BreadcrumbInstance = ReactComponentRef<typeof Breadcrumb>;
export type BreadcrumbItemInstance = ReactComponentRef<typeof BreadcrumbItem>;
