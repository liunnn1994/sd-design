import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';

import {
  createCardFoundation,
  getCardSize,
  getCardScrollMode,
} from '@sdata/web-core/card/foundation';
import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';

import type { ScrollbarProps } from '../scrollbar/index.js';
import type { SpinProps } from '../spin/index.js';

import { getRenderItems } from '../_shared/children.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Scrollbar } from '../scrollbar/index.js';
import { Spin } from '../spin/index.js';

const CardContext = createContext<
  { foundation: ReturnType<typeof createCardFoundation>; actions: ReactNode } | undefined
>(undefined);

export interface CardProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  bordered?: boolean;
  loading?: boolean;
  spinProps?: SpinProps;
  hoverable?: boolean;
  size?: 'medium' | 'small';
  headerStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  title?: ReactNode;
  extra?: ReactNode;
  cover?: ReactNode;
  actions?: ReactNode;
  fullHeight?: boolean;
  scrollbar?: boolean | ScrollbarProps;
}

function CardActions({ actions }: { actions: ReactNode }) {
  const prefix = usePrefix('card');
  return (
    <div className={`${prefix}-actions`}>
      <div className={`${prefix}-actions-right`}>
        {getRenderItems(actions).map((action) => (
          <span key={action.key} className={`${prefix}-actions-item`}>
            {action.content}
          </span>
        ))}
      </div>
    </div>
  );
}

function CardRoot({
  bordered = true,
  loading = false,
  spinProps,
  hoverable = false,
  size,
  headerStyle,
  bodyStyle,
  title,
  extra,
  cover,
  actions,
  fullHeight = false,
  scrollbar = true,
  children,
  className,
  ...attrs
}: CardProps) {
  const prefix = usePrefix('card');
  const config = useConfig();
  const [, render] = useState(0);
  const [foundation] = useState(() => {
    let metaCount = 0;
    let gridCount = 0;
    return createCardFoundation({
      get metaCount() {
        return metaCount;
      },
      set metaCount(value) {
        metaCount = value;
        render((count) => count + 1);
      },
      get gridCount() {
        return gridCount;
      },
      set gridCount(value) {
        gridCount = value;
        render((count) => count + 1);
      },
    });
  });
  const context = useMemo(() => ({ foundation, actions }), [foundation, actions]);
  const scrollMode = getCardScrollMode(fullHeight, scrollbar);
  return (
    <CardContext.Provider value={context}>
      <div
        {...attrs}
        className={[
          prefix,
          `${prefix}-size-${getCardSize(size ?? config.size)}`,
          loading && `${prefix}-loading`,
          bordered && `${prefix}-bordered`,
          hoverable && `${prefix}-hoverable`,
          foundation.hasGrid && `${prefix}-contain-grid`,
          fullHeight && `${prefix}-full-height`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {Boolean(title || extra) && (
          <div
            style={headerStyle}
            className={[`${prefix}-header`, !title && `${prefix}-header-no-title`]
              .filter(Boolean)
              .join(' ')}
          >
            {Boolean(title) && <div className={`${prefix}-header-title`}>{title}</div>}
            {Boolean(extra) && <div className={`${prefix}-header-extra`}>{extra}</div>}
          </div>
        )}
        {cover != null && <div className={`${prefix}-cover`}>{cover}</div>}
        <div
          style={bodyStyle}
          className={[
            `${prefix}-body`,
            scrollMode === 'custom' && `${prefix}-body-scroll`,
            scrollMode === 'native' && `${prefix}-body-native`,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {loading ? (
            <Spin {...config.cardSpinProps} {...spinProps} />
          ) : scrollMode === 'custom' ? (
            <Scrollbar
              type="embed"
              {...(typeof scrollbar === 'object' ? scrollbar : {})}
              outerClass={`${prefix}-body-scrollbar`}
            >
              {children}
            </Scrollbar>
          ) : (
            children
          )}
          {actions != null && !foundation.hasMeta && <CardActions actions={actions} />}
        </div>
      </div>
    </CardContext.Provider>
  );
}

export interface CardMetaProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  avatar?: ReactNode;
}

export function CardMeta({ title, description, avatar, className, ...attrs }: CardMetaProps) {
  const prefix = usePrefix('card-meta');
  const context = useContext(CardContext);
  const foundation = context?.foundation;
  useLayoutEffect(() => foundation?.registerMeta(), [foundation]);
  return (
    <div {...attrs} className={[prefix, className].filter(Boolean).join(' ')}>
      {Boolean(title || description) && (
        <div className={`${prefix}-content`}>
          {Boolean(title) && <div className={`${prefix}-title`}>{title}</div>}
          {Boolean(description) && <div className={`${prefix}-description`}>{description}</div>}
        </div>
      )}
      {(avatar != null || context?.actions != null) && (
        <div
          className={[`${prefix}-footer`, avatar == null && `${prefix}-footer-only-actions`]
            .filter(Boolean)
            .join(' ')}
        >
          {avatar != null && <div className={`${prefix}-avatar`}>{avatar}</div>}
          {context?.actions != null && <CardActions actions={context.actions} />}
        </div>
      )}
    </div>
  );
}

export interface CardGridProps extends ComponentPropsWithRef<'div'> {
  hoverable?: boolean;
}

export function CardGrid({ hoverable = false, className, children, ...attrs }: CardGridProps) {
  const prefix = usePrefix('card-grid');
  const foundation = useContext(CardContext)?.foundation;
  useLayoutEffect(() => foundation?.registerGrid(), [foundation]);
  return (
    <div
      {...attrs}
      className={[prefix, hoverable && `${prefix}-hoverable`, className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

export const Card = Object.assign(CardRoot, { Meta: CardMeta, Grid: CardGrid });

export default Card;

export type CardGridInstance = ReactComponentRef<typeof CardGrid>;
export type CardInstance = ReactComponentRef<typeof Card>;
export type CardMetaInstance = ReactComponentRef<typeof CardMeta>;
