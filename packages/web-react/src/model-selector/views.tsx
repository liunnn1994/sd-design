import type { ComponentPropsWithRef, CSSProperties } from 'react';

import { usePrefix } from '../config-provider/index.js';
import { Divider, type DividerProps } from '../divider/index.js';
import { Empty, type EmptyProps } from '../empty/index.js';
import { useI18n } from '../locale/index.js';
import { Scrollbar, type ScrollbarProps } from '../scrollbar/index.js';
import { useModelSelectorContext } from './context.js';

export type ModelSelectorListProps = ScrollbarProps;
export function ModelSelectorList({
  children,
  className,
  outerClass,
  outerStyle,
  ...attrs
}: ModelSelectorListProps) {
  const context = useModelSelectorContext('ModelSelectorList');
  const prefix = usePrefix('model-selector-list');
  const layout: CSSProperties = {
    height: `calc(100dvh - var(--${prefix}-viewport-offset))`,
    maxHeight: `var(--${prefix}-max-height)`,
    ...outerStyle,
  };
  return (
    <Scrollbar
      {...attrs}
      id={context.listId}
      className={[`${prefix}-content`, className].filter(Boolean).join(' ')}
      outerClass={[prefix, outerClass].filter(Boolean).join(' ')}
      outerStyle={layout}
      role="listbox"
      disableHorizontal
    >
      {children}
    </Scrollbar>
  );
}
export type ModelSelectorEmptyProps = EmptyProps;
export function ModelSelectorEmpty({ children, className, ...attrs }: ModelSelectorEmptyProps) {
  const context = useModelSelectorContext('ModelSelectorEmpty');
  const prefix = usePrefix('model-selector-empty');
  const { t } = useI18n();
  return context.foundation.getVisibleItems().length ? null : (
    <Empty {...attrs} className={[prefix, className].filter(Boolean).join(' ')} role="status">
      {children ?? t('modelSelector.empty')}
    </Empty>
  );
}
export type ModelSelectorShortcutProps = ComponentPropsWithRef<'kbd'>;
export function ModelSelectorShortcut({ className, ...attrs }: ModelSelectorShortcutProps) {
  const prefix = usePrefix('model-selector-shortcut');
  return <kbd {...attrs} className={[prefix, className].filter(Boolean).join(' ')} />;
}
export type ModelSelectorNameProps = ComponentPropsWithRef<'span'>;
export function ModelSelectorName({ className, ...attrs }: ModelSelectorNameProps) {
  const prefix = usePrefix('model-selector-name');
  return <span {...attrs} className={[prefix, className].filter(Boolean).join(' ')} />;
}
export type ModelSelectorLogoGroupProps = ComponentPropsWithRef<'span'>;
export function ModelSelectorLogoGroup({ className, ...attrs }: ModelSelectorLogoGroupProps) {
  const prefix = usePrefix('model-selector-logo-group');
  return <span {...attrs} className={[prefix, className].filter(Boolean).join(' ')} />;
}
export type ModelSelectorSeparatorProps = DividerProps;
export function ModelSelectorSeparator({ className, ...attrs }: ModelSelectorSeparatorProps) {
  const prefix = usePrefix('model-selector-separator');
  return <Divider {...attrs} className={[prefix, className].filter(Boolean).join(' ')} />;
}
