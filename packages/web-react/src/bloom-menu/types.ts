import type {
  BloomMenuItem as CoreItem,
  BloomMenuProps as CoreProps,
} from '@sdata/web-core/bloom-menu/types';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import type { ButtonProps } from '../button/index.js';
export type { BloomMenuOffset } from '@sdata/web-core/bloom-menu/types';
export type BloomMenuItem = CoreItem<ReactNode>;
export interface BloomMenuProps
  extends
    CoreProps<ButtonProps, ReactNode>,
    Omit<
      ComponentPropsWithRef<'div'>,
      keyof CoreProps<ButtonProps, ReactNode> | 'onSelect' | 'children'
    > {
  onModelValueChange?(value: boolean): void;
  onOpen?(): void;
  onClose?(): void;
  onSelect?(item: BloomMenuItem, index: number): void;
  renderTrigger?(options: { open(): void }): ReactNode;
  renderHeader?(options: { close(): void }): ReactNode;
  renderIcon?(options: { item: BloomMenuItem; index: number }): ReactNode;
  renderItem?(options: { item: BloomMenuItem; index: number }): ReactNode;
  empty?: ReactNode;
}
